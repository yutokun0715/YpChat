import {db,doc,setDoc,getDoc,serverTimestamp} from "./firebase.js";
export async function saveIntegration(uid,provider,data){
  await setDoc(doc(db,"users",uid,"integrations",provider),{provider,...data,updatedAt:serverTimestamp()},{merge:true});
}
export async function getIntegrations(uid){
  const out={};
  for(const p of ["github","discord","roblox"]){const s=await getDoc(doc(db,"users",uid,"integrations",p));if(s.exists())out[p]=s.data();}
  return out;
}
/*
  Discord/RobloxのOAuthアクセストークンをブラウザに置く設計は避ける。
  本番連携はFirebase Functions等でOAuth code -> token交換を行い、
  Firestoreには必要最小限の連携情報だけ保存する。
  GitHubはFirebase AuthのlinkWithPopupでこのアプリから連携可能。
*/
