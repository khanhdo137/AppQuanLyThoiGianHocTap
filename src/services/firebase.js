// src/services/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCVu6GlwGgzxsrb6j1_TgkkarsY09DwnoE",
    authDomain: "quanlythoigian-fd8a2.firebaseapp.com",
    projectId: "quanlythoigian-fd8a2",
    storageBucket: "quanlythoigian-fd8a2.appspot.com",
    messagingSenderId: "871192799884",
    appId: "1:871192799884:web:240dfdced39f80c76a29a9",
    measurementId: "G-R2FJ9ZPGT4"
};

// Kiểm tra xem Firebase đã được khởi tạo chưa
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

export { firebase, auth, firestore };
