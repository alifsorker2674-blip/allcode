"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import { Card, Button, Input, Label, Alert } from "@/components/ui";

function ProfileContent() {
  const { user, token, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await updateProfile({ name, phone: phone || undefined });
      setProfileMessage("Profile updated");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    setSavingPassword(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        token,
        body: { currentPassword, newPassword },
      });
      setPasswordMessage("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-heading mb-6 text-2xl font-bold">Profile</h1>

      <Card>
        <h2 className="font-heading mb-3 font-semibold">Account Details</h2>
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          {profileError && <Alert>{profileError}</Alert>}
          {profileMessage && <Alert variant="success">{profileMessage}</Alert>}
          <div>
            <Label>Name</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit" disabled={savingProfile} className="mt-1 self-start">
            {savingProfile ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="font-heading mb-3 font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          {passwordError && <Alert>{passwordError}</Alert>}
          {passwordMessage && <Alert variant="success">{passwordMessage}</Alert>}
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={savingPassword} variant="outline" className="mt-1 self-start">
            {savingPassword ? "Saving..." : "Change Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
