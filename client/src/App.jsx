import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { appStore } from './app/appStore';
import AppRoutes from './routes/AppRoutes';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={appStore}>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#323232',
                color: '#F4EFEA',
                borderRadius: '12px',
                border: '1px solid rgba(221, 208, 200, 0.2)'
              },
              success: {
                style: {
                  background: '#323232',
                  color: '#F4EFEA'
                }
              },
              error: {
                style: {
                  background: '#991B1B',
                  color: '#FFFFFF'
                }
              }
            }}
          />
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  );
}

export default App;
