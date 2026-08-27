import {app,isSupported,getMessaging,getToken,onMessage} from "./firebase.js";
export async function enablePush(){
  if(!("Notification" in window))throw new Error("このブラウザは通知に対応していません");
  const permission=await Notification.requestPermission();
  if(permission!=="granted")throw new Error("通知が許可されませんでした");
  if(!(await isSupported()))throw new Error("FCM Webに対応していません");
  const messaging=getMessaging(app);
  // Firebase Console > Cloud Messaging > Web configurationからVAPID Keyを設定。
  const vapidKey="YOUR_FIREBASE_WEB_PUSH_CERTIFICATE_KEY";
  if(vapidKey.startsWith("YOUR_"))throw new Error("notifications.js のVAPID Keyを設定してください");
  const token=await getToken(messaging,{vapidKey,serviceWorkerRegistration:await navigator.serviceWorker.ready});
  onMessage(messaging,payload=>console.log("FCM",payload));
  return token;
}
