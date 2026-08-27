import {rtdb,ref,set,onValue,onDisconnect,rtdbServerTimestamp} from "./firebase.js";
export function startPresence(uid){
  const statusRef=ref(rtdb,`presence/${uid}`);
  const connected=ref(rtdb,".info/connected");
  onValue(connected,s=>{
    if(s.val()!==true)return;
    onDisconnect(statusRef).set({state:"offline",lastChanged:rtdbServerTimestamp()});
    set(statusRef,{state:"online",lastChanged:rtdbServerTimestamp()});
  });
}
export function watchPresence(uid,cb){return onValue(ref(rtdb,`presence/${uid}`),s=>cb(s.val()));}
