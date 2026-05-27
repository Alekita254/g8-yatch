import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { oidcConfig } from './authConfig.js';
import App from './App.jsx';
import './index.css';

// Default to dark mode
document.documentElement.classList.add('dark');

const onSigninCallback = (_user) => {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
