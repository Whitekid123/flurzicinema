import { SessionProvider } from "@/lib/state/SessionContext";
import { RequireAuth } from "@/components/streaming/RequireAuth";

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RequireAuth>{children}</RequireAuth>
    </SessionProvider>
  );
}
