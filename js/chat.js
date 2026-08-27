import {db,collection,addDoc,query,orderBy,onSnapshot,serverTimestamp,doc,getDoc} from "./firebase.js";
import {markdown} from "./markdown.js";
let unsub=null;
export function watchChat(roomId,render){
  if(unsub)unsub();
  const q=query(collection(db,"rooms",roomId,"messages"),orderBy("timestamp","asc"));
  unsub=onSnapshot(q,s=>{
    const rows=s.docs.map(d=>({id:d.id,...d.data()}));render(rows);
  });
  return ()=>unsub?.();
}
export async function sendRoomMessage(user,roomId,text){
  if(!user||!text.trim())return;
  const p=await getDoc(doc(db,"users",user.uid));
  await addDoc(collection(db,"rooms",roomId,"messages"),{
    uid:user.uid,displayName:p.data()?.displayName||user.displayName||"User",
    text:text.trim(),timestamp:serverTimestamp(),type:"text"
  });
}
export function renderMessages(container,rows){
  container.innerHTML="";
  for(const m of rows){
    const el=document.createElement("article");el.className="message";
    const n=document.createElement("div");n.className="msg-name";n.textContent=m.displayName||"User";
    const b=document.createElement("div");b.className="msg-body";b.innerHTML=markdown(m.text||"");
    el.append(n,b);container.appendChild(el);
  }
  container.scrollTop=container.scrollHeight;
}
