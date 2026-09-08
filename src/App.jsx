import DsaTracker from "./components/DsaTracker";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <ErrorBoundary>
        <DsaTracker />
      </ErrorBoundary>
    </div>
  );
}
