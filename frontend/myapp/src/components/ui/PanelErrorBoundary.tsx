import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/** Keeps one broken widget from blanking the whole page. */
export default class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error(`[${this.props.label ?? 'Panel'}]`, error);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <p className="font-semibold">{`${this.props.label ?? 'This section'} failed to load`}</p>
          <p className="mt-1 font-mono text-xs">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
