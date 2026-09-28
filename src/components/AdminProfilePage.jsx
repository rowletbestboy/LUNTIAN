import { useState } from "react";
import { Check, KeyRound, Save, UserRound } from "lucide-react";
import { Card } from "./Card";

import { requireSupabase } from "../lib/supabase";

export default function AdminProfilePage({ user, onProfileUpdated, onLogout }) {
  const [profile, setProfile] = useState({
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Administrator",
    role: user.app_metadata?.role || "Administrator",
    email: user.email || "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword && newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    try {
      const updates = { data: { full_name: profile.name.trim() } };
      if (newPassword) updates.password = newPassword;
      const { data, error: updateError } = await requireSupabase().auth.updateUser(updates);
      if (updateError) throw updateError;
      onProfileUpdated(data.user);
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile settings saved.");
    } catch (updateError) {
      setError(updateError.message || "Could not update your account.");
    }
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
            <p className="text-sm text-muted">Update your account details stored in Supabase Auth.</p>
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
                readOnly
                className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 font-normal text-muted outline-none"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-ink">
            Email address
            <input
              type="email"
              value={profile.email}
              readOnly
              className="mt-2 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 font-normal text-muted outline-none"
            />
          </label>

          <div className="border-t border-border pt-6">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound size={17} className="text-accent" />
              <h3 className="text-sm font-bold text-ink">Change password</h3>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-ink">
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2.5 font-normal outline-none transition-colors focus:border-accent"
                />
              </label>
              <label className="text-sm font-semibold text-ink">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
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