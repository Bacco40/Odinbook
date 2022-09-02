import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import App from './App';

initializeApp({
  apiKey: "AIzaSyB3m2Awuj9ZjdWYubszkfzRGn-n6lFTjxA",
  authDomain: "odinbook-135fd.firebaseapp.com",
  projectId: "odinbook-135fd",
  storageBucket: "odinbook-135fd.appspot.com",
  messagingSenderId: "983839116701",
  appId: "1:983839116701:web:d83829c628017910bab374"
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

