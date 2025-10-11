import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Runtime error caught by ErrorBoundary:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred. You can try reloading the page.</p>
            {this.state.error && (
              <pre className="text-xs bg-gray-100 rounded p-3 overflow-auto max-h-48 mb-4">
                {this.state.error.message}
              </pre>
            )}
            <button onClick={this.handleReload} className="rounded bg-red-600 text-white px-4 py-2 hover:bg-red-700">Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
