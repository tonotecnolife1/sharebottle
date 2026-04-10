export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-lg">{children}</main>
    </div>
  );
}
