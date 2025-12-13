import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB7NgiRBJvLrZulTG4-md1XV4HAQSzPu_c",
  authDomain: "gen-lang-client-0495520981.firebaseapp.com",
  projectId: "gen-lang-client-0495520981",
  storageBucket: "gen-lang-client-0495520981.firebasestorage.app",
  messagingSenderId: "180704916004",
  appId: "1:180704916004:web:0cbd52d92324a4bccc1eb1",
  measurementId: "G-163QW3NPL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
