
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // ייבוא של Provider
import App from './App';
import store from './app/store'; // הייבוא של ה-Redux store שלך
import './services/httpClient'; // מצרף את ה-JWT לכל בקשה יוצאת (side effect only)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}> {/* עטיפת האפליקציה ב-Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);
