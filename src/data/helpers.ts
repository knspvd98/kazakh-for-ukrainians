import type { Example, MorphemePart } from "../types/course";

export const vowelsSoft = "әөүіе".split("");
export const vowelsHard = "аоұы".split("");
export const voiceless = "кқпстшщфхһцч".split("");
export const sonorMouth = "лруй".split("");
export const sonorNasal = "мнң".split("");
export const voicedSpecial = "жз".split("");

export function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-zа-яіїєґәғқңөұүһі0-9]+/giu, "-").replace(/^-|-$/g, "");
}

export function lastLetter(word: string): string {
  return [...word.trim()].filter(ch => /[a-zа-яіїєґәғқңөұүһі]/iu.test(ch)).pop()?.toLowerCase() ?? "";
}

export function isSoft(word: string): boolean {
  const letters = [...word.toLowerCase()].reverse();
  const lastVowel = letters.find(ch => vowelsSoft.includes(ch) || vowelsHard.includes(ch));
  return lastVowel ? vowelsSoft.includes(lastVowel) : false;
}

export function pickPair(word: string, hard: string, soft: string): string {
  return isSoft(word) ? soft : hard;
}

export function pluralOf(word: string): string {
  const last = lastLetter(word);
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "тар", "тер");
  if (sonorNasal.includes(last) || voicedSpecial.includes(last)) return word + pickPair(word, "дар", "дер");
  return word + pickPair(word, "лар", "лер");
}

export function locativeOf(word: string): string {
  const last = lastLetter(word);
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "та", "те") : pickPair(word, "да", "де"));
}

export function dativeOf(word: string): string {
  const last = lastLetter(word);
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "қа", "ке") : pickPair(word, "ға", "ге"));
}

export function ablativeOf(word: string): string {
  const last = lastLetter(word);
  if (sonorNasal.includes(last)) return word + pickPair(word, "нан", "нен");
  return word + (voiceless.includes(last) || "бвгд".includes(last) ? pickPair(word, "тан", "тен") : pickPair(word, "дан", "ден"));
}

export function accusativeOf(word: string): string {
  const last = lastLetter(word);
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "ты", "ті");
  if ("аеәоөұүыіиюя".includes(last)) return word + pickPair(word, "ны", "ні");
  return word + pickPair(word, "ды", "ді");
}

export function instrumentalOf(word: string): string {
  const last = lastLetter(word);
  if (voicedSpecial.includes(last)) return word + "бен";
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + "пен";
  return word + "мен";
}

export function genitiveOf(word: string): string {
  const last = lastLetter(word);
  if ("аеәоөұүыіиюя".includes(last) || sonorNasal.includes(last)) return word + pickPair(word, "ның", "нің");
  if (voiceless.includes(last) || "бвгд".includes(last)) return word + pickPair(word, "тың", "тің");
  return word + pickPair(word, "дың", "дің");
}

export function poss1Of(word: string): string {
  const base = word.endsWith("п") ? word.slice(0, -1) + "б" : word.endsWith("қ") ? word.slice(0, -1) + "ғ" : word.endsWith("к") ? word.slice(0, -1) + "г" : word;
  const last = lastLetter(base);
  return base + ("аеәоөұүыіиюя".includes(last) ? pickPair(base, "м", "м") : pickPair(base, "ым", "ім"));
}

export function makeExample(kk: string, uk: string, note?: string): Example {
  return { kk, uk, note };
}

export function defaultMorpheme(model: string): MorphemePart[] {
  if (model.includes("кітап")) {
    return [
      { text: "кітап", role: "root", label: "корінь", meaning: "книжка" },
      { text: "тар", role: "plural", label: "множина", meaning: "кілька книжок" },
      { text: "ымыз", role: "possessive", label: "належність", meaning: "наші" },
      { text: "да", role: "case", label: "місце", meaning: "у / в" }
    ];
  }
  if (model.includes("барғым")) {
    return [
      { text: "бар", role: "verb", label: "дія", meaning: "йти" },
      { text: "ғым", role: "possessive", label: "бажання від мого боку", meaning: "моє бажання зробити дію" },
      { text: "келеді", role: "verb", label: "приходить / хочеться", meaning: "формує модель бажання" }
    ];
  }
  return [
    { text: model.split(" ")[0] ?? model, role: "root", label: "основа", meaning: "головна частина" }
  ];
}