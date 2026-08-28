import {
  auth, googleProvider, githubProvider, signInWithPopup, signOut, onAuthStateChanged,
  linkWithPopup, signInAnonymously
} from "./firebase.js";

export function watchAuth(callback){ return onAuthStateChanged(auth,callback); }

export async function loginGoogle(){
  return signInWithPopup(auth,googleProvider);
}
export async function guestLogin(){ return signInAnonymously(auth); }
export async function logout(){ return signOut(auth); }
export async function linkGithub(){
  githubProvider.addScope("read:user");
  return linkWithPopup(auth.currentUser,githubProvider);
}
export function providers(){
  return auth.currentUser?.providerData?.map(x=>x.providerId) ?? [];
}