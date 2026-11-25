import { CinemaHome } from "@/components/home/CinemaHome";
import { getPublicTitles } from "@/lib/catalog/provider";
export default async function Page() {
  return <CinemaHome titles={await getPublicTitles()} />;
}
