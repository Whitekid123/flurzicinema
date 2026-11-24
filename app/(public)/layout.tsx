import { PublicShell } from "@/components/public/PublicShell";
import "@/styles/public.css";
export default function Layout({ children }: { children: React.ReactNode }) { return <PublicShell>{children}</PublicShell>; }
