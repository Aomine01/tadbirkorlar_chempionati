/// <reference types="vite/client" />

declare module "swiper/css";
declare module "swiper/css/effect-cards";

declare module "*.css" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_ENABLE_EXAM_LOCK?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_TASK1_PROMPT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
