import { extendTailwindMerge } from "tailwind-merge";

const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["2xs", "xs", "caption", "sm", "ui", "base", "md", "lg", "title", "wordmark", "display"],
      radius: ["tiny", "chip", "control", "button", "field", "palette", "card"],
      shadow: ["segment", "chip", "float", "palette", "photo", "card", "row", "knob"],
    },
  },
});

export function cn(...classes) {
  return merge(classes.filter(Boolean).join(" "));
}
