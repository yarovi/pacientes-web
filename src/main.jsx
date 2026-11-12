
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import App from './App.jsx'
import './index.css'

const discoveryUrl = import.meta.env.VITE_DESCOPE_DISCOVERY_URL

const oidcConfig = {
  authority: discoveryUrl.replace(
    /\/\.well-known\/openid-configuration\/?$/,
    ''
  ),
  metadataUrl: discoveryUrl,
  client_id: import.meta.env.VITE_DESCOPE_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid profile email full_access',
  automaticSilentRenew: false,
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      '/'
    )
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
