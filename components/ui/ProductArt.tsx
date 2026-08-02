import type { ArtKey } from "@/lib/types";

/**
 * Векторные иллюстрации категорий — временная замена фотографиям товаров.
 * Рисуются инлайн: ноль сетевых запросов, идеальная резкость на любом
 * экране и вес порядка килобайта. Как только в `product.images` появятся
 * реальные фото, `ProductImage` начнёт показывать их вместо иллюстрации.
 */

type Props = {
  art: ArtKey;
  className?: string;
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const accent = {
  ...stroke,
  stroke: "var(--color-accent)",
  strokeWidth: 1.6,
};

function Dashcam() {
  return (
    <>
      <path {...stroke} d="M104 40h32M120 40v18" />
      <rect {...stroke} x="104" y="30" width="32" height="12" rx="6" />
      <rect {...stroke} x="54" y="58" width="132" height="86" rx="16" />
      <rect {...stroke} x="66" y="70" width="108" height="62" rx="10" />
      <circle {...stroke} cx="120" cy="101" r="30" />
      <circle {...stroke} cx="120" cy="101" r="19" />
      <circle {...accent} cx="120" cy="101" r="7" />
      <path {...stroke} d="M150 118h14M150 126h9" />
      <circle {...accent} cx="72" cy="126" r="2.5" />
      <path {...stroke} d="M62 160h116M74 176h92" opacity="0.45" />
      <path {...stroke} d="M86 196h68" opacity="0.25" />
    </>
  );
}

function Alarm() {
  return (
    <>
      <rect {...stroke} x="84" y="42" width="72" height="132" rx="26" />
      <rect {...stroke} x="96" y="58" width="48" height="34" rx="8" />
      <path {...accent} d="M104 74h12M124 74h8" />
      <circle {...stroke} cx="106" cy="114" r="9" />
      <circle {...stroke} cx="134" cy="114" r="9" />
      <circle {...accent} cx="120" cy="144" r="11" />
      <path {...stroke} d="M120 30v10" />
      <path {...stroke} d="M168 76a34 34 0 0 1 0 62" opacity="0.7" />
      <path {...stroke} d="M180 60a54 54 0 0 1 0 94" opacity="0.4" />
      <path {...stroke} d="M72 76a34 34 0 0 0 0 62" opacity="0.7" />
      <path {...stroke} d="M60 60a54 54 0 0 0 0 94" opacity="0.4" />
      <path {...stroke} d="M96 196h48" opacity="0.25" />
    </>
  );
}

function Headunit() {
  return (
    <>
      <rect {...stroke} x="30" y="62" width="180" height="116" rx="12" />
      <rect {...stroke} x="42" y="74" width="126" height="92" rx="8" />
      <path {...accent} d="M56 96h44" />
      <path {...stroke} d="M56 112h84M56 126h68M56 140h52" opacity="0.5" />
      <circle {...stroke} cx="189" cy="96" r="13" />
      <path {...accent} d="M189 88v8" />
      <circle {...stroke} cx="189" cy="140" r="13" />
      <path {...stroke} d="M182 140h14" opacity="0.6" />
      <path {...stroke} d="M64 194h112" opacity="0.25" />
      <path {...stroke} d="M30 96H16M30 144H16" opacity="0.5" />
    </>
  );
}

function Speaker() {
  return (
    <>
      <circle {...stroke} cx="120" cy="118" r="82" />
      <circle {...stroke} cx="120" cy="118" r="64" />
      <circle {...stroke} cx="120" cy="118" r="38" />
      <circle {...accent} cx="120" cy="118" r="15" />
      <circle {...stroke} cx="120" cy="46" r="4" />
      <circle {...stroke} cx="120" cy="190" r="4" />
      <circle {...stroke} cx="48" cy="118" r="4" />
      <circle {...stroke} cx="192" cy="118" r="4" />
      <path
        {...stroke}
        d="M120 80v-3M120 156v3M82 118h-3M158 118h3"
        opacity="0.6"
      />
      <path {...stroke} d="M69 67 93 91M171 67l-24 24M69 169l24-24M171 169l-24-24" opacity="0.35" />
    </>
  );
}

function Sensor() {
  return (
    <>
      <path
        {...stroke}
        d="M40 150c0-10 8-18 18-18h124c10 0 18 8 18 18v14c0 6-5 11-11 11H51c-6 0-11-5-11-11z"
      />
      <path {...stroke} d="M40 158h160" opacity="0.4" />
      <circle {...accent} cx="76" cy="152" r="5" />
      <circle {...accent} cx="105" cy="152" r="5" />
      <circle {...accent} cx="135" cy="152" r="5" />
      <circle {...accent} cx="164" cy="152" r="5" />
      <path {...stroke} d="M62 118a70 70 0 0 1 116 0" opacity="0.75" />
      <path {...stroke} d="M48 96a92 92 0 0 1 144 0" opacity="0.45" />
      <path {...stroke} d="M36 74a114 114 0 0 1 168 0" opacity="0.22" />
      <path {...stroke} d="M56 186h128" opacity="0.25" />
    </>
  );
}

function Bulb() {
  return (
    <>
      <path {...stroke} d="M104 132h32v52a8 8 0 0 1-8 8h-16a8 8 0 0 1-8-8z" />
      <path {...stroke} d="M100 144h40M100 156h40M100 168h40" opacity="0.45" />
      <ellipse {...stroke} cx="120" cy="128" rx="34" ry="9" />
      <path {...stroke} d="M96 124V96a24 24 0 0 1 48 0v28" />
      <path {...accent} d="M108 104h24M108 114h24" />
      <path {...stroke} d="M120 62V46" opacity="0.7" />
      <path {...stroke} d="m88 70-10-13M152 70l10-13" opacity="0.5" />
      <path {...stroke} d="M70 96 54 88M170 96l16-8" opacity="0.3" />
      <path {...stroke} d="M84 200h72" opacity="0.25" />
    </>
  );
}

function Jumpstarter() {
  return (
    <>
      <rect {...stroke} x="76" y="44" width="88" height="152" rx="16" />
      <path {...stroke} d="M76 74h88M76 166h88" opacity="0.4" />
      <path
        {...accent}
        d="M126 88l-18 30h24l-18 32"
        strokeWidth="2"
        fill="none"
      />
      <circle {...stroke} cx="120" cy="180" r="7" />
      <path {...stroke} d="M100 60h12M120 60h20" opacity="0.6" />
      <path {...stroke} d="M164 108h26a12 12 0 0 1 12 12v26" opacity="0.7" />
      <path {...stroke} d="M76 108H50a12 12 0 0 0-12 12v26" opacity="0.7" />
      <path {...accent} d="M28 152h20l-6 12H34z" />
      <path {...accent} d="M192 152h20l-6 12h-8z" />
      <path {...stroke} d="M86 210h68" opacity="0.25" />
    </>
  );
}

function Vacuum() {
  return (
    <>
      <rect {...stroke} x="98" y="96" width="46" height="96" rx="14" />
      <path {...stroke} d="M98 118h46" opacity="0.45" />
      <path
        {...stroke}
        d="M104 96V70a12 12 0 0 1 12-12h10a12 12 0 0 1 12 12v26"
      />
      <path {...stroke} d="M126 58V42h26" />
      <path {...stroke} d="M152 42l16-14 6 8-14 14z" />
      <circle {...accent} cx="121" cy="146" r="9" />
      <path {...stroke} d="M110 168h22" opacity="0.5" />
      <path {...stroke} d="M182 66a44 44 0 0 1 4 40" opacity="0.45" />
      <path {...stroke} d="M196 56a62 62 0 0 1 6 56" opacity="0.22" />
      <path {...stroke} d="M60 66a44 44 0 0 0-4 40" opacity="0.45" />
      <path {...stroke} d="M86 208h68" opacity="0.25" />
    </>
  );
}

const arts: Record<ArtKey, () => React.ReactElement> = {
  dashcam: Dashcam,
  alarm: Alarm,
  headunit: Headunit,
  speaker: Speaker,
  sensor: Sensor,
  bulb: Bulb,
  jumpstarter: Jumpstarter,
  vacuum: Vacuum,
};

export function ProductArt({ art, className = "" }: Props) {
  const Art = arts[art] ?? Dashcam;
  return (
    <svg
      viewBox="0 0 240 240"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <Art />
    </svg>
  );
}
