import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import AppProviders from './layouts/AppProviders';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
