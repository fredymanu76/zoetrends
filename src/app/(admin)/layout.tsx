import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZoeTrends Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
