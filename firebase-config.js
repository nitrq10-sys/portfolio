import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

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

// Auth durumunu kontrol et
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("Giriş yapılan: ", user.email);
        // Page tamamen yüklendikten sonra Firebase verilerini yükle
        document.addEventListener('DOMContentLoaded', loadUserData);
    } else {
        // Giriş yapılmamışsa login.html'e yönlendir
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Kullanıcı verilerini Firebase'den yükle
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const userRef = ref(database, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            // localStorage'a Firebase verilerini yükle (page'de kullanabilsin)
            for (let key in data) {
                localStorage.setItem(key, JSON.stringify(data[key]));
            }
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
    }
}

// Kullanıcı verilerini Firebase'e kaydet
window.saveToFirebase = async function() {
    if (!currentUser) return;
    
    const userData = {};
    
    // localStorage'daki tüm veriyi Firebase'e kaydet
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
            userData[key] = JSON.parse(localStorage.getItem(key));
        } catch {
            userData[key] = localStorage.getItem(key);
        }
    }
    
    try {
        await set(ref(database, 'users/' + currentUser.uid), userData);
        console.log('Firebase\'e kaydedildi');
    } catch (error) {
        console.error('Kaydetme hatası:', error);
    }
};

// Logout
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

// Kullanıcı bilgisini göster
window.getCurrentUserEmail = function() {
    return currentUser ? currentUser.email : 'Bilinmiyor';
};

// Her 10 saniyede bir Firebase'e auto-save
setInterval(() => {
    if (currentUser) {
        saveToFirebase();
    }
}, 10000);