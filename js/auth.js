import {
  auth,
  googleProvider,
  githubProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
  signInAnonymously
} from "./firebase.js";

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Googleログイン
export async function loginGoogle() {
  return signInWithPopup(auth, googleProvider);
}

// 匿名ログイン
export async function guestLogin() {
  return signInAnonymously(auth);
}

// ログアウト
export async function logout() {
  return signOut(auth);
}

// GitHub連携
export async function linkGithub() {
  githubProvider.addScope("read:user");
  return linkWithPopup(auth.currentUser, githubProvider);
}

// 現在のログインプロバイダ一覧
export function providers() {
  return auth.currentUser?.providerData?.map(x => x.providerId) ?? [];
}
