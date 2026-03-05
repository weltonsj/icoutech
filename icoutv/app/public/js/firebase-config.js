// ==============================================
// Firebase Configuration - icouTv Portal V1.0
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB3CmRljTvnA6mHrUZfEy_A97nDVuhRVRI",
    authDomain: "icoutv-435d4.firebaseapp.com",
    projectId: "icoutv-435d4",
    storageBucket: "icoutv-435d4.firebasestorage.app",
    messagingSenderId: "1032823771031",
    appId: "1:1032823771031:web:2462cc90b4ceb66c9c7ed2",
    measurementId: "G-6Y7DEH7Z5Q"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// E-mail do administrador autorizado
const ADMIN_EMAIL = "welton.santos@icoutech.com";

// Configuração do Cloudinary (substitua pelos seus valores)
const CLOUDINARY_CONFIG = {
    cloudName: "icoutech",       // Ex: "icoutv"
    uploadPreset: "icoutv"  // Ex: "icoutv_unsigned"
};

export { app, auth, db, firebaseConfig, ADMIN_EMAIL, CLOUDINARY_CONFIG };
