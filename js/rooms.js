import {
  db,collection,doc,getDoc,setDoc,addDoc,getDocs,query,where,onSnapshot,
  serverTimestamp,updateDoc,arrayUnion
} from "./firebase.js";

let roomUnsub=null;
export async function createRoom(user,{name,joinMode,accessPassword,adminPassword}){
  if(!user)throw new Error("ログインが必要です");
  // 管理者パスワードはクライアントからFirestoreに平文保存しない。
  // v0.5ではルーム所有者=管理者。パスワードを使った管理者権限移譲はFunctions版で追加可能。
  const room=await addDoc(collection(db,"rooms"),{
    name,ownerUid:user.uid,joinMode,public:joinMode==="public",
    accessPasswordHash:accessPassword?await sha256(accessPassword):null,
    createdAt:serverTimestamp()
  });
  await setDoc(doc(db,"rooms",room.id,"members",user.uid),{
    uid:user.uid,role:"owner",joinedAt:serverTimestamp(),banned:false
  });
  return room.id;
}
export async function joinRoom(user,roomId){
  if(!user) throw new Error("ログインが必要です");
  const room=await getDoc(doc(db,"rooms",roomId));
  if(!room.exists())throw new Error("ルームがありません");
  const r=room.data();
  if(r.joinMode==="password"){
    const p=prompt("アクセスパスワード");
    if(await sha256(p||"")!==r.accessPasswordHash)throw new Error("パスワードが違います");
  }
  if(r.joinMode==="approval") {
    await setDoc(doc(db,"rooms",roomId,"joinRequests",user.uid),{
      uid:user.uid,createdAt:serverTimestamp(),status:"pending"
    });
    throw new Error("管理者の承認待ちです");
  }
  const member=await getDoc(doc(db,"rooms",roomId,"members",user.uid));
  if(member.exists()&&member.data().banned)throw new Error("このルームからBANされています");
  await setDoc(doc(db,"rooms",roomId,"members",user.uid),{
    uid:user.uid,role:"member",joinedAt:serverTimestamp(),banned:false
  },{merge:true});
}
export function watchMyRooms(uid,cb){
  return onSnapshot(query(collection(db,"rooms"),where(`memberIds`,"array-contains",uid)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}
export async function loadMyRooms(uid){
  const direct=await getDocs(query(collection(db,"rooms"),where("memberIds","array-contains",uid)));
  const owned=await getDocs(query(collection(db,"rooms"),where("ownerUid","==",uid)));
  const map=new Map();
  [...direct.docs,...owned.docs].forEach(d=>map.set(d.id,{id:d.id,...d.data()}));
  return [...map.values()];
}
export function watchPublicRooms(cb){
  return onSnapshot(query(collection(db,"rooms"),where("public","==",true)),s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}
export async function openRoomInfo(roomId){const s=await getDoc(doc(db,"rooms",roomId));return s.exists()?{id:s.id,...s.data()}:null}
export async function listMembers(roomId){
  const s=await getDocs(collection(db,"rooms",roomId,"members"));return s.docs.map(d=>({id:d.id,...d.data()}));
}
export async function banMember(roomId,uid){await updateDoc(doc(db,"rooms",roomId,"members",uid),{banned:true});}
export async function unbanMember(roomId,uid){await updateDoc(doc(db,"rooms",roomId,"members",uid),{banned:false});}
export async function approveMember(roomId,uid){
  await setDoc(doc(db,"rooms",roomId,"members",uid),{uid,role:"member",joinedAt:serverTimestamp(),banned:false});
  await updateDoc(doc(db,"rooms",roomId,"joinRequests",uid),{status:"approved"});
}
async function sha256(text){
  const b=new TextEncoder().encode(text),h=await crypto.subtle.digest("SHA-256",b);
  return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
