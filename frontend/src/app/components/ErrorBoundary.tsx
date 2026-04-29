import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Send, Home } from "lucide-react";
import { Button, Card } from "./ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReportError = () => {
    // In a real app, this would send to Sentry or a backend endpoint
    const errorLog = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log("Reporting error:", errorLog);
    alert("Error report sent to developers. Reference: ERR_" + Date.now());
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} handleReportError={this.handleReportError} />;
    }

    return this.props.children;
  }
}

export function ErrorScreen({ error, handleReportError }: { error?: Error | null, handleReportError?: () => void }) {
  return (
    <div className="min-h-screen bg-[#FDFDF7] flex items-center justify-center p-6 font-serif">
      <Card className="max-w-2xl w-full p-8 border-red-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1A4331] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md">
            We encountered an unexpected error while rendering this page. Our team has been notified.
          </p>

          <div className="w-full bg-red-50/50 rounded-sm p-4 text-left border border-red-100 mb-8 overflow-hidden">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">Error Details</p>
            <div className="bg-white/50 p-3 rounded border border-red-200 overflow-x-auto">
               <code className="text-xs text-red-600 whitespace-pre-wrap block">
                 {error?.name}: {error?.message}
               </code>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#1A4331] hover:bg-[#112d21] text-white gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleReportError || (() => alert("Error report sent to developers. Reference: ERR_" + Date.now()))}
              className="border-red-200 text-red-700 hover:bg-red-50 gap-2"
            >
              <Send className="w-4 h-4" /> Report Issue
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="text-gray-500 gap-2"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

import { useRouteError } from "react-router";

export function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorScreen error={error} />;
}
