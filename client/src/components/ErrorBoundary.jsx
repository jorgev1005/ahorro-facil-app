import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', backgroundColor: '#xffe', height: '100vh', overflow: 'auto' }}>
                    <h1>Algo salió mal (Error de Aplicación)</h1>
                    <p>Por favor envía una captura de este error al desarrollador:</p>
                    <pre style={{ backgroundColor: '#eee', padding: '10px', borderRadius: '5px' }}>
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '8px' }}
                    >
                        Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
