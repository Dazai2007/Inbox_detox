import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.css'
import ErrorBoundary from './components/ErrorBoundary'
import { I18nProvider } from './context/I18nContext'
import { AuthProvider } from './context/AuthContext'

// HATA DÜZELTMESİ: react-router-dom kütüphanesinden BrowserRouter'u import et
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
{/* HATA DÜZELTMESİ: Tüm uygulamayı BrowserRouter ile sarmala /}
{/ Bu, useNavigate'in çalışması için GEREKLİDİR */}
<BrowserRouter>
<ErrorBoundary>
<AuthProvider>
<I18nProvider>
<App />
</I18nProvider>
</AuthProvider>
</ErrorBoundary>
</BrowserRouter>
</React.StrictMode>,
)