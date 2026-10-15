import { ART_FONTS, normalizeText } from "../lib/art-fonts";
import type { DesignOptions } from "../types";

/** Font picker preview: smooth vector text from the actual font file,
 * not the discrete wall cells. What you pick is the typeface; the walls
 * built from it are shown on the main canvas. */
export default function LetterPreview({
  font,
  text,
}: {
  font: DesignOptions["font"];
  text: string;
}) {
  const name = ART_FONTS.find((f) => f.id === font)?.name ?? font;
  const specimen =
    [...normalizeText(text).replace(/\s+/g, "").trim()].slice(0, 6).join("") ||
    "Aa";
  return (
    <span
      aria-hidden="true"
      className="font-preview"
      style={{
        fontFamily: `'${name}', 'Be Vietnam Pro', cursive`,
        fontSize: "28px",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
      }}
    >
      {specimen}
    </span>
  );
}
