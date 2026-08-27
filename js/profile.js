import {db,doc,getDoc,setDoc,serverTimestamp} from "./firebase.js";
export async function ensureProfile(user){
  const r=doc(db,"users",user.uid), s=await getDoc(r);
  if(!s.exists()) await setDoc(r,{
    displayName:user.displayName || `User-${user.uid.slice(0,6)}`,
    font:"system",plateColor:"#5b8cff",status:"online",onlineVisible:true,
    dmPolicy:"friends",createdAt:serverTimestamp()
  });
}
export async function loadProfile(uid){
  const s=await getDoc(doc(db,"users",uid)); return s.exists()?s.data():null;
}
export async function saveProfile(uid,data){ await setDoc(doc(db,"users",uid),data,{merge:true}); }
