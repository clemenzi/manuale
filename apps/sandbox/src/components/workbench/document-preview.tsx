import type { ReactNode } from "react";

export type DocumentPreviewProps = {
  meta?: ReactNode;
  sandbox?: string;
  srcDoc: string;
  title: string;
};

export function DocumentPreview({ meta, sandbox, srcDoc, title }: DocumentPreviewProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-muted/30 px-3 py-1">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        {meta ? <span className="text-xs">{meta}</span> : null}
      </header>

      <iframe
        className="min-h-0 flex-1 border-0 bg-white"
        sandbox={sandbox}
        srcDoc={srcDoc}
        title={title}
      />
    </section>
  );
}
