import {db,collection,doc,getDoc,setDoc,addDoc,getDocs,query,where,onSnapshot,serverTimestamp,updateDoc} from "./firebase.js";
export async function searchUsers(name){
  const s=await getDocs(query(collection(db,"users"),where("displayName","==",name)));
  return s.docs.map(d=>({id:d.id,...d.data()}));
}
export async function requestFriend(from,to){
  if(from===to)return;
  await setDoc(doc(db,"friendRequests",`${from}_${to}`),{from,to,status:"pending",createdAt:serverTimestamp()});
}
export function watchIncoming(uid,cb){
  return onSnapshot(query(collection(db,"friendRequests"),where("to","==",uid),where("status","==","pending")),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}
export async function acceptFriend(id,from,to){
  await updateDoc(doc(db,"friendRequests",id),{status:"accepted"});
  await setDoc(doc(db,"friends",`${from}_${to}`),{a:from,b:to,createdAt:serverTimestamp()});
  await setDoc(doc(db,"friends",`${to}_${from}`),{a:to,b:from,createdAt:serverTimestamp()});
}
export async function getFriends(uid){
  const s=await getDocs(query(collection(db,"friends"),where("a","==",uid)));
  return Promise.all(s.docs.map(async d=>{
    const x=d.data(),p=await getDoc(doc(db,"users",x.b));return {uid:x.b,...(p.data()||{})};
  }));
}
