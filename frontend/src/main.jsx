import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'

// HashRouter: routes live under `/#/...` so static hosts (Render) always serve
// `index.html` for `/` and never 404 on direct loads like `/order` or `/cart`.
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </HashRouter>
)