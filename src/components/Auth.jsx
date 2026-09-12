import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Auth({ initialMode = "login", onContinueAsGuest }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) {
          throw loginError;
        }

        setMessage("Login successful.");
      } else {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signupError) {
          throw signupError;
        }

        if (data.session) {
          setMessage("Account created successfully.");
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account."
          );
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);

      setError(
        err?.message ||
          "Something went wrong. Please check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "signup" : "login"
    );

    setError("");
    setMessage("");
  };

  const handleGuestMode = () => {
    setError("");
    setMessage("");

    if (typeof onContinueAsGuest === "function") {
      onContinueAsGuest();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              DSA Tracker
            </h1>

            <p className="mt-2 text-text-muted">
              {isLogin
                ? "Sign in to continue tracking your progress."
                : "Create an account to save your progress."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            <div>
  <label
    htmlFor="password"
    className="block text-sm font-medium mb-2"
  >
    Password
  </label>

  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Enter your password"
      autoComplete={
        isLogin ? "current-password" : "new-password"
      }
      disabled={loading}
      className="w-full rounded-lg border border-border bg-bg px-4 py-3 pr-12 text-text outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      disabled={loading}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {onContinueAsGuest && (
            <button
              type="button"
              onClick={handleGuestMode}
              disabled={loading}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-semibold text-text transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue as Guest
            </button>
          )}

          <div className="mt-6 text-center text-sm text-text-muted">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}