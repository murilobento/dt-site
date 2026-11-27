import { extendTailwindMerge } from "tailwind-merge";

/** twMerge ciente da escala tipográfica própria (text-label-lg etc. são tamanhos, não cores). */
export const cn = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "display-lg-mobile",
            "headline-lg",
            "headline-lg-mobile",
            "headline-md",
            "title-lg",
            "title-md",
            "body-lg",
            "body-md",
            "label-lg",
            "label-sm",
            "mono-md",
          ],
        },
      ],
    },
  },
});
