import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Arabic-friendly text normalization for substring search. Strips combining
 * diacritics (fatha, damma, kasra, shadda, sukun, …) and collapses common
 * letter variants so a search for "احمد" still finds "أحمد", "إحمد", "آحمد",
 * and "ى"/"ي" / "ة"/"ه" pairs are treated as equivalent.
 *
 * Use this on BOTH the search term and the target string before calling
 * `.includes()` — otherwise a user typing "احمد" would miss "أحمد".
 */
export function normalizeArabic(s: string): string {
  return s
    .normalize("NFD")
    // remove combining diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // unify alef variants
    .replace(/[أإآٱ]/g, "ا")
    // unify ya / alef-maqsoura
    .replace(/ى/g, "ي")
    // unify ta-marbuta ↔ ha
    .replace(/ة/g, "ه")
    .toLowerCase();
}
