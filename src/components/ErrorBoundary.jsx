import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(err) {
    return { hasError: true, error: err };
  }

  componentDidCatch(error, errorInfo) {
    console.error(">>> ERROR BOUNDARY >>>", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100 text-danger">
          <h4>Something went wrong</h4>
          <pre className="small">{this.state.error?.message}</pre>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
