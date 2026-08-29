import { Component } from "react";

/**
 * Catches any render-time crash in the route tree and shows a safe fallback
 * instead of a blank screen or a leaked stack trace. Details go to the
 * console for developers only — never to the user.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--bg-primary, #0b1220)",
        }}
      >
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary, #f4f8fc)", margin: 0 }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary, #a9b9cc)",
              margin: "10px 0 20px",
              lineHeight: 1.6,
            }}
          >
            The page ran into an unexpected error. Reloading usually fixes it.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 22px",
              borderRadius: 12,
              border: "none",
              background: "#10b981",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
