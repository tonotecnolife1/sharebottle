import { redirect } from "next/navigation";

// ママもさくらママに相談できる。Cast ruri-mama page をそのまま使う。
export default function MamaRuriMamaPage({
  searchParams,
}: {
  searchParams: { customerId?: string };
}) {
  const qs = searchParams.customerId
    ? `?customerId=${searchParams.customerId}`
    : "";
  redirect(`/cast/ruri-mama${qs}`);
}
