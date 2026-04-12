export default function CustomerLoading() {
  return (
    <div className="px-5 pt-8 pb-6 space-y-4 animate-pulse">
      <div className="h-4 w-20 bg-pearl-soft rounded-btn" />
      <div className="h-8 w-48 bg-pearl-soft rounded-btn" />
      <div className="grid grid-cols-3 gap-2.5">
        <div className="h-20 bg-pearl-soft rounded-card" />
        <div className="h-20 bg-pearl-soft rounded-card" />
        <div className="h-20 bg-pearl-soft rounded-card" />
      </div>
      <div className="h-36 bg-pearl-soft rounded-card" />
      <div className="h-36 bg-pearl-soft rounded-card" />
    </div>
  );
}
