// ═══════════════════════════════════════════════════════
// QUANTUM TRADER — AUTH SYSTEM (Firebase)
// ═══════════════════════════════════════════════════════

import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const ADMIN_EMAIL = "admin@quantumtrader.pro";

export async function register({ name, email, password, acceptedTerms }) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, role: "student", status: "pending",
      acceptedTerms, registeredAt: serverTimestamp(),
      approvedAt: null, lastLogin: null, tradesCount: 0, notes: "",
    });
    await signOut(auth);
    return { ok: true };
  } catch (e) { return { ok: false, msg: firebaseError(e.code) }; }
}

export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) { await signOut(auth); return { ok: false, msg: "Usuario no encontrado." }; }
    const user = { uid: cred.user.uid, ...snap.data() };
    if (user.status === "pending") {
      await signOut(auth);
      return { ok: false, msg: "Tu cuenta está pendiente de aprobación.", status: "pending" };
    }
    if (user.status === "rejected") {
      await signOut(auth);
      return { ok: false, msg: "Tu acceso ha sido rechazado. Contacta al administrador.", status: "rejected" };
    }
    await updateDoc(doc(db, "users", cred.user.uid), { lastLogin: serverTimestamp() });
    sessionStorage.setItem("qt_session", JSON.stringify({
      uid: user.uid, name: user.name, email: user.email, role: user.role
    }));
    return { ok: true, user };
  } catch (e) { return { ok: false, msg: firebaseError(e.code) }; }
}

export async function logout() {
  await signOut(auth);
  sessionStorage.removeItem("qt_session");
  window.location.href = "index.html";
}

export function getSession() {
  const s = sessionStorage.getItem("qt_session");
  return s ? JSON.parse(s) : null;
}

export function requireAuth(adminOnly = false) {
  const session = getSession();
  if (!session) { window.location.href = "index.html"; return null; }
  if (adminOnly && session.role !== "admin") { window.location.href = "app.html"; return null; }
  return session;
}

function firebaseError(code) {
  const map = {
    "auth/email-already-in-use": "Este email ya está registrado.",
    "auth/invalid-email": "Email inválido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "Email o contraseña incorrectos.",
    "auth/wrong-password": "Email o contraseña incorrectos.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return map[code] || "Error: " + code;
}
