import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  LogIn,
  LogOut,
  UserRoundPlus,
  Cloud,
  CloudOff,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const GUEST_KEY = "dsa-tracker:guest-mode";

export default function ProfileMenu({ session, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isGuest = !session;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGuestMode = async () => {
    setOpen(false);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Guest mode sign-out failed:", error);
    }

    try {
      localStorage.setItem(GUEST_KEY, "true");
    } catch {
      // Ignore storage errors.
    }

    window.location.reload();
  };

  const handleLogin = () => {
    setOpen(false);

    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      // Ignore storage errors.
    }

    if (onLogin) {
      onLogin();
    } else {
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    setOpen(false);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }

    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      // Ignore storage errors.
    }

    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-text transition hover:bg-surface-hover"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
          <UserRound size={17} />
        </div>

        <div className="hidden text-left sm:block">
          <div className="text-sm font-semibold">
            {session ? "My Profile" : "Guest"}
          </div>

          <div className="max-w-[180px] truncate text-xs text-text-muted">
            {session ? session.user.email : "Local mode"}
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          {/* Profile header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <UserRound size={21} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-text">
                  {session ? "My Profile" : "Guest Mode"}
                </p>

                <p className="truncate text-xs text-text-muted">
                  {session
                    ? session.user.email
                    : "Progress is saved on this device"}
                </p>
              </div>
            </div>
          </div>

          {/* Sync status */}
          <div className="p-3">
            <div className="flex items-center gap-3 rounded-xl bg-bg p-3">
              {session ? (
                <>
                  <Cloud size={19} className="text-green-400" />

                  <div>
                    <p className="text-sm font-medium text-text">
                      Cloud Sync
                    </p>

                    <p className="text-xs text-text-muted">
                      Account connected
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <CloudOff size={19} className="text-yellow-400" />

                  <div>
                    <p className="text-sm font-medium text-text">
                      Local Storage
                    </p>

                    <p className="text-xs text-text-muted">
                      Cloud sync unavailable
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-border p-2">
            {session ? (
              <>
                <button
                  type="button"
                  onClick={handleGuestMode}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-text transition hover:bg-bg"
                >
                  <UserRound size={18} />

                  <div>
                    <p className="font-medium">Continue as Guest</p>
                    <p className="text-xs text-text-muted">
                      Switch to local progress
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <LogOut size={18} />

                  <div>
                    <p className="font-medium">Logout</p>
                    <p className="text-xs text-red-400/70">
                      Sign out of this account
                    </p>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLogin}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-text transition hover:bg-bg"
                >
                  <LogIn size={18} />

                  <div>
                    <p className="font-medium">Login</p>
                    <p className="text-xs text-text-muted">
                      Sync progress with your account
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-text transition hover:bg-bg"
                >
                  <UserRoundPlus size={18} />

                  <div>
                    <p className="font-medium">Create Account</p>
                    <p className="text-xs text-text-muted">
                      Save progress to the cloud
                    </p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}