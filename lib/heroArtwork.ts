import type {Movie} from "@/types/cinema";
/** Extra original scenes belong only to the named fictional demo records. */
const scenes:Record<string,string[]> = {
 "quiet-beyond":["/images/hero/quiet-cave.webp"],
 "last-train":["/images/hero/train-carriage.webp"],
 "velvet-hours":["/images/hero/velvet-translator.webp"],
};
export function heroArtwork(movie:Movie):string[]{
 const extra=movie.availability.startsWith("Fictional") ? scenes[movie.id]||[] : [];
 return [...new Set([movie.backdrop,movie.poster,...extra].filter(Boolean))];
}
