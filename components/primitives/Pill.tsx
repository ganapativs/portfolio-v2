export function Pill({
  children,
  warm = false,
  dot = false,
}: {
  children: React.ReactNode;
  warm?: boolean;
  dot?: boolean;
}) {
  return (
    <span className={`pill ${warm ? "warm" : ""}`}>
      {dot && <span className="dot" />} {children}
    </span>
  );
}
