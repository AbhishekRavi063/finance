import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {  getApps, getApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDujxj82S5rF6sbNtWy7hz6heFRYKGRGos",
    authDomain: "personal-finance-dashboa-3cc67.firebaseapp.com",
    projectId: "personal-finance-dashboa-3cc67",
    storageBucket: "personal-finance-dashboa-3cc67.firebasestorage.app",
    messagingSenderId: "537717440738",
    appId: "1:537717440738:web:d4578474747a4e22c5debb",
    measurementId: "G-TTLYV73TYD"
  };
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  export const auth = getAuth(app);