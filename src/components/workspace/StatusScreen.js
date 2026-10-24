export function StatusScreen({ title, children, action }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-studio p-6 text-center">
      <div className="max-w-sm">
        <p className="font-wordmark text-wordmark font-black tracking-title">Fomi</p>
        <h1 className="mt-6 text-title font-heavy tracking-heading">{title}</h1>
        <p className="mt-2 text-ui text-ink-2">{children}</p>
        <div className="mt-5 flex justify-center">{action}</div>
      </div>
    </main>
  );
}
