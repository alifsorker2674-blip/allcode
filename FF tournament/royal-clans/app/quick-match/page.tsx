import RequireAuth from "@/components/RequireAuth";
import QuickMatchClient from "@/components/QuickMatchClient";

export default function QuickMatchPage() {
  return (
    <RequireAuth>
      <QuickMatchClient />
    </RequireAuth>
  );
}
