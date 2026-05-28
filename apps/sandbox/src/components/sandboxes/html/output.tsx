export default function Output({ value }: { value: string }) {
  const title = getTitle(value) || "Senza titolo";

  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex bg-muted/30 px-3 py-1 border-b items-center justify-between">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <span className="text-xs">{value.length} Bytes</span>
      </header>

      <iframe title={title} srcDoc={value} className="min-h-0 flex-1 border-0 bg-white" />
    </section>
  );
}

function getTitle(html: string) {
  return new DOMParser().parseFromString(html, "text/html").title;
}
