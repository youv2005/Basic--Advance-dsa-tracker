import { useEffect, useState } from "react";
import DsaTracker from "./components/DsaTracker";
import ErrorBoundary from "./components/ErrorBoundary";
import Auth from "./components/Auth";
import { supabase } from "./lib/supabase";

const GUEST_KEY = "dsa-tracker:guest-mode";

export default function App() {
  const [session, setSession] = useState(null);

  const [guestMode, setGuestMode] = useState(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get the current logged-in session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        console.error("Failed to get session:", error);
      }

      const currentSession = data?.session ?? null;

      setSession(currentSession);

      // If the user is logged in, disable guest mode
      if (currentSession) {
        try {
          localStorage.removeItem(GUEST_KEY);
        } catch {
          // Ignore storage errors.
        }

        setGuestMode(false);
      }

      setLoading(false);
    });

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);

        if (nextSession) {
          try {
            localStorage.removeItem(GUEST_KEY);
          } catch {
            // Ignore storage errors.
          }

          setGuestMode(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Continue without an account
  const continueAsGuest = () => {
    try {
      localStorage.setItem(GUEST_KEY, "true");
    } catch {
      // Guest mode can still continue if storage is unavailable.
    }

    setGuestMode(true);
  };

  // Initial loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p className="text-text-muted">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <ErrorBoundary>
        {session || guestMode ? (
          <DsaTracker session={session} />
        ) : (
          <Auth onContinueAsGuest={continueAsGuest} />
        )}
      </ErrorBoundary>
    </div>
  );
}


