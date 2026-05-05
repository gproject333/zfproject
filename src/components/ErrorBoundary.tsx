"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Card} from "@/components/ui";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches uncaught render errors in child components and shows a
 * neobrutalism-styled fallback instead of crashing the whole route.
 *
 * Used to wrap each role's <DashboardLayout> content so a buggy
 * dashboard panel can't take down the entire app shell.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Log to the browser console for dev visibility. In production this
    // is where you'd hook up Sentry / a remote logger.
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-destructive/10 nb-border rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-xl font-extrabold mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-muted-foreground font-medium mb-5">
              نأسف على الإزعاج. حاول إعادة تحميل الصفحة أو العودة لاحقاً.
            </p>
            {this.state.error?.message && (
              <pre className="text-xs text-left bg-muted/50 p-3 rounded-lg nb-border mb-5 overflow-auto whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            )}
            <Button onPress={this.handleReset} variant="primary" fullWidth>
              <RefreshCw className="w-4 h-4" />
              المحاولة مرة أخرى
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
