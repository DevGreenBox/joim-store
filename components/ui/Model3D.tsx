"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Трёхмерная модель устройства — своя, а не раскадровка облёта.
 *
 * Сетка идёт целиком, без прореживания: кластеризация по решётке теряла
 * почти половину граней и оставляла на корпусе рваные клинья. Полная
 * сетка — 522 КБ по сети, меньше прежней раскадровки из 72 снимков.
 *
 * Раньше здесь листались 72 снимка: это 5° на кадр, и сколько ни смешивай
 * соседние кадры, ось остаётся одна и «покрутить» можно только вокруг неё.
 * Тут рисуется настоящая геометрия из STL заказчика (`scripts/prepare-model.mjs`
 * прореживает её и пакует в Int16), поэтому вращение свободное: предмет
 * поворачивается вокруг любой оси, куда повели рукой.
 *
 * Библиотеки нет. Нужен обычный WebGL2: буфер вершин и две программы
 * в тридцать строк. Нормаль не хранится и не передаётся — она считается
 * в шейдере от производных экранных координат. Корпус плоскогранный,
 * плоская заливка ему и идёт, а данных вдвое меньше.
 *
 * Поворот хранится кватернионом. Кватернион не знает, где «ноль»: нет
 * ни перехода через 360°, ни складывания углов, ни рывка при переходе —
 * есть только текущая ориентация и угловая скорость.
 */

/** Доля угловой скорости, остающаяся за секунду. */
const FRICTION = 0.06;
/** Постоянная скорость свободного вращения, рад/с. */
const IDLE_SPEED = 0.45;
/** Полный оборот за столько долей ширины блока. */
const TURN = 0.9;
/** Больше этого шаг времени не берём: вкладка была в фоне. */
const MAX_STEP = 0.05;

type Quat = [number, number, number, number];

function qMul(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

function qFromAxis(x: number, y: number, z: number, angle: number): Quat {
  const len = Math.hypot(x, y, z) || 1;
  const s = Math.sin(angle / 2);
  return [(x / len) * s, (y / len) * s, (z / len) * s, Math.cos(angle / 2)];
}

function qNorm(q: Quat): Quat {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

/** Кватернион в матрицу 4×4 (по столбцам, как ждёт WebGL). */
function qMat(q: Quat): Float32Array {
  const [x, y, z, w] = q;
  return new Float32Array([
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ]);
}

const VERT = `#version 300 es
in vec3 position;
uniform mat4 uModel;
uniform mat4 uProj;
uniform float uScale;
out vec3 vView;
out vec3 vLocal;
void main() {
  vec3 local = position * uScale;
  vLocal = local;
  vec4 p = uModel * vec4(local, 1.0);
  p.z -= 2.6;
  vView = p.xyz;
  gl_Position = uProj * p;
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vView;
in vec3 vLocal;
uniform sampler2D uFront;
uniform sampler2D uBack;
uniform vec3 uHalf;
uniform mat3 uNormal;
out vec4 outColor;

/**
 * Цвет берётся не с потолка: на грани корпуса кладутся заводские виды
 * «Лицевая под 90» и «Задняя под 90» из библиотеки заказчика. Это
 * ортогональные рендеры той же модели — их силуэт совпадает с габаритом
 * геометрии до 0,6 %, поэтому проекция ложится точно, без развёртки.
 *
 * Грань выбирается по знаку модельной нормали: смотрит вперёд — лицевой
 * вид, назад — задний с зеркалом по горизонтали. Узкие боковые грани
 * берут цвет края текстуры, и там сам собой продолжается зелёный кант.
 */
void main() {
  // Нормаль из производных: грань плоская, значит одна нормаль на весь
  // треугольник. Хранить её незачем.
  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
  if (n.z < 0.0) n = -n;
  vec3 v = normalize(-vView);

  vec3 key = normalize(vec3(-0.45, 0.75, 0.75));
  vec3 fill = normalize(vec3(0.7, -0.25, 0.45));

  float kd = max(dot(n, key), 0.0);
  float fd = max(dot(n, fill), 0.0);

  // Графит корпуса, подсветка фирменным зелёным по контуру. Заливка
  // держится тёмной намеренно: предмет стоит на графите страницы,
  // и светлая модель на нём выглядит гипсовой.
  // Корпус — матовый графит, накладки, эмблема и кнопка — фирменный
  // зелёный. Эмблема и кнопка приходят отдельными деталями из геометрии,
  // накладки — маской.
  // Модельная нормаль — из производных модельной позиции. Её знак зависит
  // от обхода вершин, поэтому разворачиваем к зрителю через ту же матрицу,
  // что и сам корпус: иначе лицо с изнанкой меняются местами.
  vec3 nLocal = normalize(cross(dFdx(vLocal), dFdy(vLocal)));
  if ((uNormal * nLocal).z < 0.0) nLocal = -nLocal;

  vec2 uv = vec2(vLocal.x / uHalf.x, -vLocal.y / uHalf.y) * 0.5 + 0.5;

  // Боковые грани и торцы узкие: натянутый на них лицевой вид размазывается
  // в полосы. Они берут цвет ровно с того края текстуры, к которому
  // повёрнуты, — там кант и продолжается без швов.
  // Порог высокий: у корпуса скруглены длинные рёбра, и при мягком пороге
  // изогнутая часть канта ещё тянула на себя лицевой вид и шла полосами.
  // Настоящие лицевая и задняя грани плоские, у них |nz| почти единица.
  bool edge = abs(nLocal.z) < 0.80;
  if (edge) {
    // Берём не саму кромку, а полоску чуть внутри: по краю рендера идёт
    // сглаженный силуэт, и цвет оттуда сыпался шумом по канту.
    if (abs(nLocal.x) >= abs(nLocal.y)) {
      uv.x = nLocal.x >= 0.0 ? 0.94 : 0.06;
    } else {
      uv.y = nLocal.y >= 0.0 ? 0.022 : 0.978;
    }
  }

  // Лицевая грань модели смотрит в минус Z, поэтому зеркалить надо её,
  // а не заднюю: иначе логотип читается наоборот.
  // На гранях, взятых с кромки, читаем размытый уровень мипмапа: там
  // важен цвет канта, а не рисунок, и мелкая рябь рендера туда не идёт.
  float blur = edge ? 3.5 : 0.0;
  vec4 skin = nLocal.z < 0.0
    ? textureLod(uFront, vec2(1.0 - uv.x, uv.y), blur)
    : textureLod(uBack, uv, blur);

  // Рендер в sRGB, свет считаем в линейном.
  vec3 albedo = pow(skin.rgb, vec3(2.2)) * 0.16;
  // Крашеный пластик накладок глянцевее матового корпуса.
  bool accent = dot(skin.rgb, vec3(0.30, 0.59, 0.11)) > 0.34;

  vec3 lit = albedo * (0.12 + 2.40 * kd) + albedo * 2.0 * fd * 0.35;

  vec3 h = normalize(key + v);
  float gloss = accent ? 120.0 : 70.0;
  float spec = accent ? 0.45 : 0.22;
  lit += vec3(0.90) * pow(max(dot(n, h), 0.0), gloss) * spec;

  float rim = pow(1.0 - max(dot(n, v), 0.0), 4.5);
  lit += vec3(0.60, 0.77, 0.33) * rim * 0.22;

  outColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

export function Model3D({
  src,
  front,
  back,
  poster,
  label,
}: {
  /** Упакованная сетка из `scripts/prepare-model.mjs`. */
  src: string;
  /** Заводские виды под 90°: они ложатся на лицевую и заднюю грани. */
  front: string;
  back: string;
  poster: string;
  label: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [held, setHeld] = useState(false);

  const spin = useRef<Quat>([0, 0, 0, 1]);
  const rate = useRef<[number, number, number]>([0, 0, 0]);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const heldRef = useRef(false);

  // Грузим сетку, только когда блок подошёл к экрану.
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(() => setLoad(true));
      return () => cancelAnimationFrame(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!load) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    let alive = true;
    let frame = 0;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }

    const uModel = gl.getUniformLocation(program, "uModel");
    const uProj = gl.getUniformLocation(program, "uProj");
    const uScale = gl.getUniformLocation(program, "uScale");
    const uHalf = gl.getUniformLocation(program, "uHalf");
    const uNormal = gl.getUniformLocation(program, "uNormal");

    /** Заводской вид как текстура грани. */
    const loadSkin = (url: string, unit: number, name: string) =>
      new Promise<void>((done) => {
        const img = new window.Image();
        img.onload = () => {
          const tex = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          // По краям — растяжка крайнего пикселя: узкие боковые грани
          // берут цвет ровно с канта, а не заворачивают текстуру.
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.useProgram(program);
          gl.uniform1i(gl.getUniformLocation(program, name), unit);
          done();
        };
        img.onerror = () => done();
        img.src = url;
      });

    let vertices = 0;

    (async () => {
      const [buffer] = await Promise.all([
        (await fetch(src)).arrayBuffer(),
        loadSkin(front, 0, "uFront"),
        loadSkin(back, 1, "uBack"),
      ]);
      if (!alive) return;
      const head = new DataView(buffer, 0, 20);
      vertices = head.getUint32(0, true);
      const scale = head.getFloat32(4, true);
      const half: [number, number, number] = [
        head.getFloat32(8, true),
        head.getFloat32(12, true),
        head.getFloat32(16, true),
      ];
      const data = new Int16Array(buffer, 20);

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(loc);
      // Int16 читаем как float без нормализации: масштаб уходит в шейдер
      // отдельным числом. `vertexAttribIPointer` тут нельзя — он отдаёт
      // целое, а шейдер ждёт `vec3`, и драйвер молча ничего не рисует.
      gl.vertexAttribPointer(loc, 3, gl.SHORT, false, 0, 0);

      gl.useProgram(program);
      gl.uniform1f(uScale, scale * 0.98);
      // Половины габарита в тех же единицах, что и вершины после uScale.
      gl.uniform3f(uHalf, half[0] * 0.98, half[1] * 0.98, half[2] * 0.98);
      gl.enable(gl.DEPTH_TEST);
      // Отсечения задних граней нет: обход вершин в STL не гарантирован,
      // и при `CULL_FACE` модель могла исчезнуть целиком. Нормаль в шейдере
      // и так разворачивается к зрителю.
      gl.clearColor(0, 0, 0, 0);
      setReady(true);

      let last = performance.now();

      const size = () => {
        const box = canvas.getBoundingClientRect();
        // Потолок плотности 1,5, а не 2: у модели заливка на весь квадрат,
        // и на ретине четыре пикселя вместо одного стоят вчетверо дороже
        // при разнице, которую на матовой заливке не видно.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(box.width * dpr);
        canvas.height = Math.round(box.height * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        const aspect = canvas.width / canvas.height || 1;
        const f = 1 / Math.tan(0.42);
        gl.uniformMatrix4fv(uProj, false, new Float32Array([
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, -1.02, -1,
          0, 0, -0.2, 0,
        ]));
      };

      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, MAX_STEP);
        last = now;

        if (!heldRef.current) {
          // Угловая скорость сходится к постоянному вращению вокруг оси
          // предмета, а не к нулю: он не встаёт и не «включается» заново.
          const target: [number, number, number] = calm ? [0, 0, 0] : [0, IDLE_SPEED, 0];
          const decay = Math.pow(FRICTION, dt);
          for (let i = 0; i < 3; i++) {
            rate.current[i] = target[i] + (rate.current[i] - target[i]) * decay;
          }
          const w = Math.hypot(...rate.current);
          if (w > 1e-4) {
            spin.current = qNorm(
              qMul(
                qFromAxis(rate.current[0], rate.current[1], rate.current[2], w * dt),
                spin.current,
              ),
            );
          }
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const m = qMat(spin.current);
        gl.uniformMatrix4fv(uModel, false, m);
        // Верхняя 3×3 того же поворота — для разворота нормали к зрителю.
        gl.uniformMatrix3fv(uNormal, false, new Float32Array([
          m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10],
        ]));
        gl.drawArrays(gl.TRIANGLES, 0, vertices);
      };

      size();
      window.addEventListener("resize", size);
      frame = requestAnimationFrame(tick);

      return () => window.removeEventListener("resize", size);
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
    };
  }, [load, src, front, back]);

  function onDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!ready) return;
    drag.current = { x: event.clientX, y: event.clientY };
    rate.current = [0, 0, 0];
    heldRef.current = true;
    setHeld(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* пусто */
    }
  }

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    const from = drag.current;
    if (!from) return;
    const box = event.currentTarget.clientWidth || 1;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;

    // Ось поворота перпендикулярна движению руки в плоскости экрана.
    // Отсюда и свобода: ведут вбок — крутится вокруг вертикали, ведут
    // вниз — через себя, ведут по диагонали — вокруг наклонной оси.
    const angle = (Math.hypot(dx, dy) / (box * TURN)) * Math.PI * 2;
    if (angle > 0) {
      spin.current = qNorm(qMul(qFromAxis(dy, dx, 0, angle), spin.current));
      const dt = 1 / 60;
      rate.current = [(dy / Math.hypot(dx, dy)) * angle / dt, (dx / Math.hypot(dx, dy)) * angle / dt, 0];
    }
    drag.current = { x: event.clientX, y: event.clientY };
  }

  function onUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    heldRef.current = false;
    setHeld(false);
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    } catch {
      /* пусто */
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-square w-full max-w-[560px] touch-pan-y select-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ cursor: held ? "grabbing" : "grab" }}
      role="group"
      aria-label={`${label}: модель устройства, можно крутить`}
      tabIndex={0}
    >
      {/* Пока сетка не пришла — заводской рендер. Он же остаётся, если
          в браузере нет WebGL2. */}
      <Image
        src={poster}
        alt={label}
        fill
        sizes="(max-width: 639px) 90vw, 560px"
        className={`object-contain transition-opacity duration-700 ${
          ready && !failed ? "opacity-0" : "opacity-100"
        }`}
      />

      {failed ? null : (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 size-full transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
