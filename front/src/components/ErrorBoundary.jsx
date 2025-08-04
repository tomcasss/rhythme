import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Actualiza el estado para mostrar la UI de error en el próximo render
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puedes registrar el error aquí
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div style={{
          padding: '2rem',
          border: '1px solid #e74c3c',
          borderRadius: '8px',
          backgroundColor: '#ffeaea',
          color: '#c0392b',
          margin: '1rem 0'
        }}>
          <h2>¡Algo salió mal!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            <summary>Detalles del error (click para expandir)</summary>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              marginTop: '0.5rem', 
              borderRadius: '4px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              <br />
              <strong>Stack:</strong> {this.state.errorInfo.componentStack}
            </div>
          </details>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
