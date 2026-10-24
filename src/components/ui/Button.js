import { cn } from "@/lib/cn";

const variants = {
  ink: "border-transparent bg-ink text-white hover:bg-ink-hover active:bg-black",
  line: "border-line bg-white text-ink hover:border-control hover:bg-panel",
  ghost: "border-transparent text-ink-2 hover:bg-ink/5 hover:text-ink",
};

const sizes = {
  sm: "h-8 rounded-button px-3 text-sm",
  md: "h-9 rounded-button px-3.5 text-ui",
  lg: "h-11 rounded-field px-4 text-md",
};

export function buttonClasses({ variant = "line", size = "md", className } = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 border font-semibold leading-none whitespace-nowrap transition-[background-color,border-color,color,scale] duration-150 ease-out active:scale-98 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({ variant, size, className, type = "button", ...props }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
