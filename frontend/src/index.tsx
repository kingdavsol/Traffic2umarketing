// QuickSell - v1.1.0 - Dec 12, 2025
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './styles/index.css';
import App from './App';
import { store } from './store';

// Force bundle hash change
console.log('QuickSell v1.1.0 - Build 20251212');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
