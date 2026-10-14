export const vowels = [..."aăâeêioôơuưy"];
export const tones = ["", "\u0300", "\u0301", "\u0309", "\u0303", "\u0323"];
export const vowelRows = vowels.flatMap((v) =>
  [v, v.toUpperCase()].map((base) =>
    tones.map((t) => (base + t).normalize("NFC")),
  ),
);
export const vietnamese = [...new Set([...vowelRows.flat(), ..."đĐ"])];
export const alphabet = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
];
export const punctuation = [
  ...`.,;:!?…-–—'"“”‘’«»()[]{}\/\\&@#%*+=_<>$^\u0060|~`,
];
export const phrases = [
  "Phúc!",
  "“An”",
  "Đỗ Mỹ",
  "Hữu Ý",
  "Tĩnh!",
  "Ứng?",
  "Quỳnh",
  "Nguyễn",
  "Tết…",
  "A/B",
  "Linh: An",
  "a\nb",
  "aế\nậy",
];
