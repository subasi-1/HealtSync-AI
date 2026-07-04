import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <Card className="max-w-md p-6 border-destructive/20 bg-destructive/[0.01] shadow-fluentLg space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-destructive/10 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  System Rendering Exception
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-none mt-0.5">
                  An unhandled UI runtime crash occurred
                </p>
              </div>
            </div>

            <div className="bg-card p-3 rounded border border-border/80 text-[11px] font-mono text-muted-foreground max-h-[140px] overflow-y-auto leading-normal">
              {this.state.error?.message || 'Unknown javascript exception.'}
            </div>

            <p className="text-xs text-muted-foreground leading-normal">
              We recommend reloading the dashboard context. If this issue persists, please report it to the central health administration hub.
            </p>

            <Button
              variant="primary"
              onClick={this.handleRecover}
              className="w-full h-9 font-semibold gap-1.5 shadow-sm active:scale-95 mt-2"
            >
              <RefreshCw className="h-4 w-4" /> Reload Portal Interface
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
