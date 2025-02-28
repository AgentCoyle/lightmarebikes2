// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYvZcb69IYVEc9PSPwR75DeP5ulkKM9pU",
    authDomain: "lightmarebikes2.firebaseapp.com",
    projectId: "lightmarebikes2",
    storageBucket: "lightmarebikes2.firebasestorage.app",
    messagingSenderId: "633724931662",
    appId: "1:633724931662:web:03bfd23e11754bd622bd1f"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };