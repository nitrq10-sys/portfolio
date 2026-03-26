import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC2Q6nqbY7DCVt1JMWWeMIRKJYn5hmk71w",
    authDomain: "portfolio-app-4ace0.firebaseapp.com",
    databaseURL: "https://portfolio-app-4ace0-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "portfolio-app-4ace0",
    storageBucket: "portfolio-app-4ace0.firebasestorage.app",
    messagingSenderId: "244537001992",
    appId: "1:244537001992:web:db4133c24cd7bf365ce9bd",
    measurementId: "G-1P1YED1DFZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let isSavingFromWeb = false;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Giriş yapılan: ", user.email);
        startRealtimeListener();
    } else {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

function isValidFirebaseKey(key) {
    if (key.startsWith('firebase:') || key.startsWith('@firebase')) return false;
    if (/[.#$\/\[\]]/.test(key)) return false;
    return true;
}

function startRealtimeListener() {
    if (!currentUser) return;

    const userRef = ref(database, 'users/' + currentUser.uid);

    onValue(userRef, (snapshot) => {
        if (isSavingFromWeb) return;

        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Firebase verisi geldi, keyler:', Object.keys(data));

            for (let key in data) {
                const value = data[key];
                if (typeof value === 'object' && value !== null) {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
            }

            if (typeof window.refreshUI === 'function') {
                window.refreshUI();
            }
        }
    });
}

window.saveToFirebase = async function() {
    if (!currentUser) return;

    const userData = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!isValidFirebaseKey(key)) continue;

        const raw = localStorage.getItem(key);
        try {
            userData[key] = JSON.parse(raw);
        } catch {
            userData[key] = raw;
        }
    }

    try {
        isSavingFromWeb = true;
        await set(ref(database, 'users/' + currentUser.uid), userData);
        console.log("Firebase'e kaydedildi");
    } catch (error) {
        console.error('Kaydetme hatası:', error);
    } finally {
        setTimeout(() => { isSavingFromWeb = false; }, 500);
    }
};

window.logout = function() {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        }).catch((error) => {
            alert('Çıkış hatası: ' + error.message);
        });
    }
};

window.getCurrentUserEmail = function() {
    return currentUser ? currentUser.email : 'Bilinmiyor';
};
