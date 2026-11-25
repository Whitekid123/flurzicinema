import { SessionProvider } from "@/lib/state/SessionContext";
import { RequireAuth } from "@/components/streaming/RequireAuth";

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RequireAuth requireProfile>{children}</RequireAuth>
    </SessionProvider>
  );
}
