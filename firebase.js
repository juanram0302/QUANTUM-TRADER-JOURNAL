// ═══════════════════════════════════════════════════════
// QUANTUM TRADER — FIREBASE CONFIG
// ═══════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOp7iCsYvbzBJlHD_Pni-8w1jaAagCGvU",
  authDomain: "quantum-trader-2bfb8.firebaseapp.com",
  projectId: "quantum-trader-2bfb8",
  storageBucket: "quantum-trader-2bfb8.firebasestorage.app",
  messagingSenderId: "10367039371",
  appId: "1:10367039371:web:98ab364add4459b103a18e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
