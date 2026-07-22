import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines conditional class names (clsx) and resolves conflicting
// Tailwind utility classes (tailwind-merge), e.g. cn("p-2", isBig && "p-4")
// correctly resolves to "p-4" instead of leaving both classes present.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
