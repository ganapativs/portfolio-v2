// Anchored absolutely against the nearest positioned ancestor (.surface).
export function AmbientBlob() {
  return (
    <div className="ambient-blob" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
    </div>
  );
}
