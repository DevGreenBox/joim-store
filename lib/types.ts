export type ArtKey =
  | "dashcam"
  | "alarm"
  | "headunit"
  | "speaker"
  | "sensor"
  | "bulb"
  | "jumpstarter"
  | "vacuum";

export type Spec = {
  label: string;
  value: string;
};

export type ProductImage = {
  /** Путь от корня `public/`. */
  src: string;
  /** Что на кадре: подпись под миниатюрой и основа для alt. */
  caption: string;
  /**
   * Кадр заполняет рамку, а не вписывается в неё с полем. Ставится
   * репортажным снимкам: у них фон — сам сюжет, и поле вокруг превращает
   * кадр в фотографию в рамке. Пакшоты вырезаны по контуру, им нужно
   * поле — для них флага нет.
   */
  cover?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  art: ArtKey;
  /** Подпись кнопки на витрине категорий: «Смотреть модели», «Смотреть PVC-1». */
  cta: string;
  /** Кадр товара сбоку от текста на витрине категорий. */
  cover: { src: string; alt: string };
};

/** Крупное показание в начале карточки: «3300 А», «более 20». */
export type Highlight = {
  value: string;
  /** Единица, если её надо набрать мельче: «А», «мВт·ч». Пусто — не набираем. */
  unit?: string;
  label: string;
};

/** Сценарий применения: одна ситуация — один блок. */
export type Scenario = {
  title: string;
  text: string;
  /** Кадр из материалов заказчика. Нет — рисуем показание крупно. */
  image?: string;
  /** Репортажный кадр заполняет рамку — см. `ProductImage.cover`. */
  cover?: boolean;
  /** Что вынести цифрой поверх блока: «−30 °C», «40 минут». */
  readout?: string;
};

/**
 * Блок рич-контента карточки — тот самый «маркетплейсный» слой, который
 * заказчик просил уметь набирать под каждый товар самостоятельно
 * (структура 17.08, п. 4.2).
 *
 * Блоки лежат в `content/catalog/products.json` списком и рисуются
 * по `type`. Добавить материал под новый товар — значит дописать объект
 * в список, а не звать разработчика верстать секцию.
 *
 * Типов пять, и это осознанный потолок: у каждого своя работа, и любой
 * маркетплейсный разворот собирается их сочетанием.
 */
export type RichBlock =
  | {
      /** Крупный баннер: кадр и надпись поверх колонки текста. */
      type: "banner";
      title: string;
      text?: string;
      image: string;
      /** Кадр слева, а не справа: чередование по странице. */
      flip?: boolean;
      /** Светлая плашка — для чередования цветов по блокам. */
      light?: boolean;
      /**
       * Кадр — сцена, а не вырезанный пакшот: заполняет ячейку целиком
       * и обрезается по краю. Пакшоту наоборот нужны поля и подложка,
       * иначе он упирается в рамку.
       */
      scene?: boolean;
    }
  | {
      /** Просто текст с заголовком: объяснение без картинки. */
      type: "text";
      title: string;
      paragraphs: string[];
    }
  | {
      /** Кадр или ролик во всю ширину. */
      type: "media";
      image?: string;
      video?: { src: string; poster: string; ratio: string };
      caption?: string;
      /** См. `scene` у баннера. */
      scene?: boolean;
    }
  | {
      /** Пары «показание — подпись»: три-четыре цифры в ряд. */
      type: "specs";
      title?: string;
      items: { value: string; unit?: string; label: string }[];
    }
  | {
      /** Короткие пункты в колонках — то, что на маркетплейсе рисуют
          иконками. Здесь вместо иконки номер: рисовать нечем. */
      type: "columns";
      title?: string;
      items: { title: string; text: string }[];
    };

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  sku: string;
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  short: string;
  description: string;
  specs: Spec[];
  features: string[];
  /** Четыре показания под ценой — то, ради чего модель покупают. */
  highlights: Highlight[];
  /** Кому эта модель и кому не нужна. Отсечка пишется прямо. */
  fits: {
    /** Одна строка: кому берут. */
    who: string;
    /** Одна строка: когда переплачивать не за что. */
    skip?: string;
  };
  /** Сценарии применения — мини-лендинг модели. */
  scenarios: Scenario[];
  /** Техника, на которой работает. Пусто — не показываем блок. */
  compatibility?: string[];
  /** От чего защищает электроника. Пусто — не показываем блок. */
  protections?: string[];
  /** Что лежит в коробке — первым пунктом само устройство. */
  included: string[];
  /**
   * Рич-контент карточки: баннеры и материалы под конкретный товар.
   * Нет блоков — раздела на странице просто не будет.
   */
  rich?: RichBlock[];
  /** 360°-облёт, если он есть в библиотеке заказчика. */
  spin?: {
    /**
     * Упакованная сетка устройства: `scripts/prepare-model.mjs` делает её
     * из STL заказчика. Рисует `components/ui/Model3D.tsx`.
     */
    model: string;
    /** Заводские виды под 90°, ложатся текстурой на грани корпуса. */
    front: string;
    back: string;
    /** Профили края для боковых граней и торцов. */
    side: string;
    end: string;
    /** Заводской рендер: стоит, пока сетка грузится, и вместо неё без WebGL2. */
    poster: string;
    title: string;
    text: string;
  };
  /** Промо-ролик бренда. Пропорции — как у исходного файла. */
  video?: {
    src: string;
    poster: string;
    ratio: string;
    title: string;
    text?: string;
  };
  /** Ракурсы товара. Пусто — рисуем векторную заглушку по категории. */
  images: ProductImage[];
  /**
   * Номер ракурса, на который плитка переходит при наведении. Выбирается
   * вручную: у каждой модели интересен свой второй кадр — у одной клеммы,
   * у другой разъёмы, у третьей кейс с насадками. Нет значения — плитка
   * остаётся на первом ракурсе.
   */
  hoverImage?: number;
  /**
   * Габариты посылки для расчёта доставки: вес в граммах, стороны в см.
   * Значения оценочные и требуют подтверждения у заказчика — так же,
   * как состав коробки.
   */
  shipping: {
    weight: number;
    length: number;
    width: number;
    height: number;
  };
};

export type CartLine = {
  slug: string;
  qty: number;
};

export type SortKey = "popular" | "price-asc" | "price-desc" | "new";
