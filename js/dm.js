import {db,collection,doc,getDoc,setDoc,addDoc,query,where,orderBy,onSnapshot,serverTimestamp} from "./firebase.js";
export function threadId(a,b){return [a,b].sort().join("_");}
export async function canDM(from,to){
  const p=await getDoc(doc(db,"users",to));if(!p.exists())return false;
  const policy=p.data().dmPolicy||"friends";
  if(policy==="everyone")return true;
  if(policy==="none")return false;
  const f=await getDoc(doc(db,"friends",`${to}_${from}`));return f.exists();
}
export async function sendDM(from,to,text){
  if(!(await canDM(from,to)))throw new Error("このユーザーはDMを受け付けていません");
  const id=threadId(from,to);
  await setDoc(doc(db,"dms",id),{a:from,b:to,lastMessage:text,lastAt:serverTimestamp()},{merge:true});
  await addDoc(collection(db,"dms",id,"messages"),{from,to,text:text.trim(),timestamp:serverTimestamp()});
}
export function watchDM(a,b,cb){
  const id=threadId(a,b);
  return onSnapshot(query(collection(db,"dms",id,"messages"),orderBy("timestamp","asc")),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}
