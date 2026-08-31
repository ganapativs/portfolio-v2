// Without an explicit title, derive an accessible name from the source host
// (e.g. "Embedded content from codesandbox.io") so screen-reader users get
// something meaningful instead of a generic, indistinguishable label.
function fallbackTitle(src: string): string {
  try {
    return `Embedded content from ${new URL(src).hostname.replace(/^www\./, "")}`;
  } catch {
    return "Embedded content";
  }
}

export function Iframe({
  src,
  title,
  ratio = "16 / 9",
}: {
  src: string;
  title?: string;
  ratio?: string;
}) {
  return (
    <div style={{ aspectRatio: ratio, width: "100%", margin: "var(--s-5) 0" }}>
      <iframe
        src={src}
        title={title ?? fallbackTitle(src)}
        loading="lazy"
        sandbox="allow-scripts allow-popups allow-forms"
        style={{ width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}
