import { Component } from "react";
import { AlertTriangle } from "lucide-react";

// Error boundaries must be class components — React has no Hook
// equivalent for getDerivedStateFromError/componentDidCatch.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Nothing to send this to (no backend, by design) — but logging to
    // the console keeps it visible for local debugging instead of
    // silently swallowing it.
    console.error("DSA Tracker crashed:", error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-surface border border-hard/30 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={28} className="text-hard" aria-hidden="true" />
          <h1 className="font-semibold">Something went wrong</h1>
          <p className="text-sm text-text-muted">
            The tracker hit an unexpected error. Your saved progress is untouched — reloading usually fixes this.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-1 text-sm font-medium bg-accent text-bg rounded-lg px-4 py-2 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
