import { SessionProvider } from "@/lib/state/SessionContext";
import { RequireAuth } from "@/components/streaming/RequireAuth";
import { StreamingShell } from "@/components/streaming/StreamingShell";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RequireAuth>
        <StreamingShell>{children}</StreamingShell>
      </RequireAuth>
    </SessionProvider>
  );
}
