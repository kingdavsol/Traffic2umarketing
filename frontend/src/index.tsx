// QuickSell - v1.2.3 - Dec 13, 2025 - Layout accepts children fix
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './styles/index.css';
import App from './App';
import { store } from './store';

// Force bundle hash change
console.log('QuickSell v1.2.3 - Build 20251213-4 - Layout children support');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
