import { useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import campusImage from "../assets/54da0dba-a67b-44e0-abe9-8a4f154ee423.jpg";
import luntianLogo from "../assets/Luntian logo.png";

export default function SignInPage({ onAuthenticated, onCancel }) {
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const savedPasskey = localStorage.getItem("luntian-admin-passkey") || "LUNTIAN-ADMIN";
    if (passkey.trim() !== savedPasskey) {
      setError("That passkey is not recognized. Please try again.");
      return;
    }

    sessionStorage.setItem("luntian-admin-authenticated", "true");
    onAuthenticated();
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-10"
      style={{ backgroundImage: `linear-gradient(rgba(24, 55, 31, 0.48), rgba(24, 55, 31, 0.48)), url(${campusImage})` }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white/70 shadow-[0_24px_70px_rgba(8,30,15,0.38)] backdrop-blur-md lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-navy/85 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[28px] border-[#4A8445]/30" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border-[38px] border-[#D8E8D5]/10" />

          <div className="relative">
            <button
              type="button"
              onClick={onCancel}
              aria-label="Back to dashboard"
              className="mb-4 hidden h-9 w-9 items-center justify-center rounded-lg border border-white/35 text-xl leading-none text-ice transition-colors hover:border-[#A8CFA3] hover:text-white lg:flex"
            >
              &lt;
            </button>
            <div className="mb-10 flex items-center gap-3">
              <img src={luntianLogo} alt="Luntian logo" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <div className="text-sm font-bold leading-tight tracking-wide">LUNTIAN</div>
                <div className="text-[9px] tracking-[0.18em] text-faint">RESOURCE MANAGEMENT</div>
              </div>
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8CFA3]">
              Private control room
            </p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">
              Keep the campus moving with confidence.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-ice/75">
              One secure view for energy, water, buildings, and the people who keep them running.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-ice/70">
            <ShieldCheck size={16} className="text-[#A8CFA3]" />
            Protected administrator access
          </div>
        </section>

        <section className="flex min-h-[560px] flex-col justify-center bg-white/72 px-7 py-10 sm:px-14">
          <div className="mb-10 lg:hidden">
            <button
              type="button"
              onClick={onCancel}
              aria-label="Back to dashboard"
              className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xl leading-none text-muted transition-colors hover:border-accent hover:text-accent"
            >
              &lt;
            </button>
            <div className="flex items-center gap-3">
              <img src={luntianLogo} alt="Luntian logo" className="h-10 w-10 rounded-xl object-contain" />
              <div>
                <div className="text-sm font-bold leading-tight text-navy">LUNTIAN</div>
                <div className="text-[9px] tracking-[0.18em] text-muted">RESOURCE MANAGEMENT</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E8] text-accent">
              <LockKeyhole size={22} />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Administrator sign in</p>
            <h2 className="text-5xl font-bold tracking-wide text-navy">LUNTIAN</h2>
            <p className="mt-2 max-w-sm text-base font-semibold text-ink">Welcome back.</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
              Enter your private passkey to access the Luntian resource dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-sm">
            <label htmlFor="passkey" className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink">
              Admin passkey
            </label>
            <div className={`flex items-center rounded-xl border bg-white px-3 transition-colors ${error ? "border-crit" : "border-border focus-within:border-accent"}`}>
              <KeyRound size={17} className="shrink-0 text-muted" />
              <input
                id="passkey"
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(event) => {
                  setPasskey(event.target.value);
                  setError("");
                }}
                placeholder="Enter your passkey"
                autoComplete="current-password"
                autoFocus
                className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-faint"
              />
              <button
                type="button"
                onClick={() => setShowPasskey((visible) => !visible)}
                className="px-1 text-xs font-semibold text-muted transition-colors hover:text-accent"
              >
                {showPasskey ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-crit">{error}</p>}
            <button
              type="submit"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#376A34]"
            >
              Enter dashboard
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-8 max-w-sm text-[11px] leading-5 text-muted">
            This dashboard is intended for authorized campus administrators. Your session stays private to this browser.
          </p>
        </section>
      </div>
    </main>
  );
}