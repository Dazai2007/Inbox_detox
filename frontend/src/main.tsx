import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import ErrorBoundary from './components/ErrorBoundary'
import { I18nProvider } from './context/I18nContext'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
