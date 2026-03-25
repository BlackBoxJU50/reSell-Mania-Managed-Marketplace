import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'

import api from './utils/api'

console.log('%c[reSell Mania] %v1.2.0-Diagnostic-Active', 'color: #ff9900; font-weight: bold;');
console.log('[DEBUG] API Base URL:', api.defaults.baseURL);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
