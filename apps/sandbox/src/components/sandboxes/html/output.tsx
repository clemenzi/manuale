import { DocumentPreview } from "#/components/workbench/document-preview";

export default function Output({ value }: { value: string }) {
  const title = getTitle(value) || "Senza titolo";

  return <DocumentPreview meta={`${value.length} Bytes`} srcDoc={value} title={title} />;
}

function getTitle(html: string) {
  return new DOMParser().parseFromString(html, "text/html").title;
}
