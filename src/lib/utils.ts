import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts (Shadcn convention). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
