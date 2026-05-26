export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border-strong)] px-4 py-3">
        <div className="h-5 w-5 animate-pulse rounded-full bg-[var(--bg-elevated)]" />
        <div className="h-5 w-32 animate-pulse rounded bg-[var(--bg-elevated)]" />
        <div className="ml-auto h-4 w-20 animate-pulse rounded bg-[var(--bg-elevated)]" />
      </div>

      {/* Mensagens */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
        {[
          { w: "w-48", self: false },
          { w: "w-64", self: true },
          { w: "w-40", self: false },
          { w: "w-56", self: false },
          { w: "w-72", self: true },
          { w: "w-44", self: false },
          { w: "w-60", self: true },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${item.self ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--bg-elevated)]" />
            <div
              className={`h-10 animate-pulse rounded-2xl bg-[var(--bg-elevated)] ${item.w}`}
            />
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border-strong)] p-3">
        <div className="h-10 animate-pulse rounded-lg bg-[var(--bg-elevated)]" />
      </div>
    </div>
  )
}
