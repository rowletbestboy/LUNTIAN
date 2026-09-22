import { useState } from "react";
import { Check, KeyRound, Save, UserRound } from "lucide-react";
import { Card } from "./Card";

const PROFILE_STORAGE_KEY = "luntian-admin-profile";
const DEFAULT_PROFILE = {
  name: "Admin User",
  role: "Super Administrator",
  email: "admin@campus.local",
};

function getStoredProfile() {
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function AdminProfilePage({ onProfileUpdated, onLogout }) {
  const [profile, setProfile] = useState(getStoredProfile);
  const [newPasskey, setNewPasskey] = useState("");
  const [confirmPasskey, setConfirmPasskey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPasskey && newPasskey.length < 8) {
      setError("Your new passkey must be at least 8 characters.");
      return;
    }
    if (newPasskey !== confirmPasskey) {
      setError("The new passkey and confirmation do not match.");
      return;
    }

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    if (newPasskey) {
      localStorage.setItem("luntian-admin-passkey", newPasskey);
      setNewPasskey("");
      setConfirmPasskey("");
    }
    onProfileUpdated(profile);
    setMessage("Profile settings saved.");
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Card className="p-5 sm:p-7">
        <div className="mb-7 flex items-center gap-3 border-b border-border pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF3E8] text-accent">
            <UserRound size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink">Profile details</h2>
            <p className="text-sm text-muted">Update the information shown in the administrator panel.</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-ink">
              Display name
              <input
                value={profile.name}
                onChange={(event) => updateProfile("name", event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
              />
            </label>
            <label className="text-sm font-semibold text-ink">
              Role
              <input
                value={profile.role}
                onChange={(event) => updateProfile("role", event.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-ink">
            Email address
            <input
              type="email"
              value={profile.email}
              onChange={(event) => updateProfile("email", event.target.value)}
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
            />
          </label>

          <div className="border-t border-border pt-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={17} className="text-accent" />
              <h3 className="text-sm font-bold text-ink">Change passkey</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                New passkey
                <input
                  type="password"
                  value={newPasskey}
                  onChange={(event) => setNewPasskey(event.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                Confirm passkey
                <input
                  type="password"
                  value={confirmPasskey}
                  onChange={(event) => setConfirmPasskey(event.target.value)}
                  placeholder="Repeat new passkey"
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#376A34]">
              <Save size={16} />
              Save changes
            </button>
            {message && <span className="flex items-center gap-1.5 text-sm font-medium text-accent"><Check size={16} />{message}</span>}
            {error && <span className="text-sm font-medium text-crit">{error}</span>}
          </div>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-[#E3B9B2] px-4 py-2.5 text-sm font-semibold text-crit transition-colors hover:bg-[#FFF4F1]"
          >
            Log out
          </button>
        </div>
      </Card>
    </div>
  );
}