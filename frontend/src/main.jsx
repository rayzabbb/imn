
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // ייבוא של Provider
import App from './App';
import store from './app/store'; // הייבוא של ה-Redux store שלך

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* עטיפת האפליקציה ב-Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
