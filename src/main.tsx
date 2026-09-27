import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ProgressProvider } from './data/progress'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import { CatalogueProvider } from './data/catalog'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider><CatalogueProvider><ProgressProvider><App /></ProgressProvider></CatalogueProvider></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
