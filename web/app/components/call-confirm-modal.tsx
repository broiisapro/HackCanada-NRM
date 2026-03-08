'use client';

interface CallConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  calling: boolean;
  callResult: { success: boolean; error?: string } | null;
}

export function CallConfirmModal({ open, onClose, onConfirm, calling, callResult }: CallConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !calling) onClose(); }}
    >
      <div className="mx-4 w-full max-w-md rounded-xl border p-6 shadow-2xl [background:var(--bg-card)] [border-color:var(--border-default)]">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--maroon-900)]/50">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-[var(--maroon-400)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </div>

        {callResult ? (
          /* ── Result state ── */
          <div className="text-center">
            <h3
              className={`mb-2 text-lg font-bold tracking-tight ${callResult.success ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {callResult.success ? 'Call Placed Successfully' : 'Call Failed'}
            </h3>
            <p className="mb-5 text-sm [color:var(--text-secondary)]">
              {callResult.success
                ? 'The emergency dispatch call has been initiated. The AI agent will deliver the fire detection report.'
                : callResult.error ?? 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="press-active rounded-lg border px-5 py-2 text-sm font-medium [border-color:var(--border-default)] [color:var(--text-secondary)] hover:[border-color:var(--maroon-800)] hover:[color:var(--text-primary)]"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Confirmation state ── */
          <>
            <h3
              className="mb-2 text-center text-lg font-bold tracking-tight text-[var(--maroon-400)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Confirm Emergency Call
            </h3>
            <p className="mb-5 text-center text-sm [color:var(--text-secondary)]">
              This will place an automated phone call to emergency services, reporting the detected wildfire threat with current detection data. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={calling}
                className="press-active flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium [border-color:var(--border-default)] [color:var(--text-secondary)] hover:[border-color:var(--maroon-800)] hover:[color:var(--text-primary)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={calling}
                className="press-active flex-1 rounded-lg bg-[var(--maroon-600)] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--maroon-500)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--maroon-500)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
                aria-busy={calling}
              >
                {calling ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Calling...
                  </span>
                ) : (
                  'Call Now'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
