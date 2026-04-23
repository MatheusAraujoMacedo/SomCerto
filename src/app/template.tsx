import { ClientLayout } from "@/components/layout/client-layout";

export default function Template({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
