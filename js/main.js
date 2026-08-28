import {watchAuth,loginGoogle,guestLogin,logout,linkGithub} from "./auth.js";
import {ensureProfile,loadProfile,saveProfile} from "./profile.js";
import {startPresence,watchPresence} from "./presence.js";
import {createRoom,joinRoom,watchPublicRooms,openRoomInfo} from "./rooms.js";
import {watchChat,sendRoomMessage,renderMessages} from "./chat.js";
import {searchUsers,requestFriend,watchIncoming,acceptFriend,getFriends} from "./friends.js";
import {sendDM,watchDM} from "./dm.js";
import {enablePush} from "./notifications.js";
import {renderAdmin} from "./admin.js";
import {getIntegrations} from "./integrations.js";

let user=null,currentRoom=null,currentDM=null,unChat=null,unDM=null;

const $=id=>document.getElementById(id);

function show(page){
  document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
  $(`page-${page}`).classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
  $("sidebar").classList.remove("open");
}

function notice(title,text){
  $("noticeTitle").textContent=title;
  $("noticeText").textContent=text;
  noticeDialog.showModal();
}

function renderRoomButton(r){
  const b=document.createElement("button");
  b.className="nav";
  b.textContent=`💬 ${r.name}`;
  b.onclick=()=>enterRoom(r.id);
  $("roomList").appendChild(b);
}

async function enterRoom(id){
  const r=await openRoomInfo(id);
  if(!r)return;

  try{
    await joinRoomSafe(id);
  }catch(e){
    if(e.message.includes("承認")){
      notice("承認待ち",e.message);
      return;
    }

    if(!e.message.includes("すでに")){
      notice("参加できません",e.message);
      return;
    }
  }

  currentRoom=id;
  $("chatRoomName").textContent=r.name;
  $("chatRoomMeta").textContent=`参加方式: ${r.joinMode}`;

  show("chat");

  if(unChat)unChat();

  unChat=watchChat(id,rows=>{
    renderMessages($("messages"),rows);
  });
}

async function joinRoomSafe(id){
  const {joinRoom}=await import("./rooms.js");
  await joinRoom(user,id);
}

async function refreshRooms(){
  $("roomList").innerHTML="";

  const mine=await (await import("./rooms.js")).loadMyRooms(user.uid);
  mine.forEach(renderRoomButton);

  watchPublicRooms(rows=>{
    $("publicRooms").innerHTML="";

    rows.forEach(r=>{
      const el=document.createElement("div");
      el.className="room-card";

      el.innerHTML=`<b>${r.name}</b><div class="muted">公開ルーム</div>`;

      const b=document.createElement("button");
      b.className="primary";
      b.textContent="参加";

      b.onclick=()=>enterRoom(r.id);

      el.appendChild(b);
      $("publicRooms").appendChild(el);
    });
  });
}

async function loadSettings(){
  const p=await loadProfile(user.uid);
  if(!p)return;

  $("displayName").value=p.displayName||"";
  $("plateColor").value=p.plateColor||"#5b8cff";
  $("fontName").value=p.font||"system";
  $("onlineVisibility").value=p.onlineVisible===false?"hidden":"visible";
  $("status").value=p.status||"online";
  $("dmPolicy").value=p.dmPolicy||"friends";
  $("topName").textContent=p.displayName||"User";
}

async function loadFriends(){
  $("friends").innerHTML="";

  const fs=await getFriends(user.uid);

  fs.forEach(f=>{
    const el=document.createElement("div");
    el.className="dm-person";
    el.textContent=`${f.displayName||f.uid} — ${f.status||"offline"}`;

    el.onclick=()=>openDM(f.uid,f.displayName||"DM");

    $("friends").appendChild(el);
  });
}

function renderRequests(rows){
  $("friendRequests").innerHTML="";

  rows.forEach(r=>{
    const el=document.createElement("div");
    el.className="card";

    el.innerHTML=`<b>${r.from}</b> からフレンド申請`;

    const b=document.createElement("button");
    b.className="primary";
    b.textContent="承認";

    b.onclick=async()=>{
      await acceptFriend(r.id,r.from,user.uid);
      await loadFriends();
      el.remove();
    };

    el.appendChild(b);
    $("friendRequests").appendChild(el);
  });
}

async function openDM(uid,name){
  currentDM=uid;
  show("dms");

  $("dmTitle").innerHTML=`<h2>${name}</h2>`;

  if(unDM)unDM();

  unDM=watchDM(user.uid,uid,rows=>{
    renderMessages(
      $("dmMessages"),
      rows.map(x=>({
        displayName:x.from===user.uid?"自分":name,
        text:x.text
      }))
    );
  });
}

document.querySelectorAll(".nav").forEach(
  b=>b.onclick=()=>show(b.dataset.page)
);

$("mobileMenu").onclick=()=>$("sidebar").classList.toggle("open");

$("profileBtn").onclick=()=>show("settings");

// Googleログイン
$("msLogin").onclick=async()=>{
  try{
    await loginGoogle();
  }catch(e){
    $("loginError").textContent=e.message;
  }
};

// 匿名ログイン
$("guestLogin").onclick=async()=>{
  try{
    await guestLogin();
  }catch(e){
    $("loginError").textContent=e.message;
  }
};

$("logout").onclick=logout;

$("newRoom").onclick=()=>roomDialog.showModal();

$("refreshRooms").onclick=refreshRooms;

$("roomForm").addEventListener("submit",async e=>{
  e.preventDefault();

  try{
    const id=await createRoom(user,{
      name:$("newRoomName").value.trim(),
      joinMode:$("joinMode").value,
      accessPassword:$("accessPassword").value,
      adminPassword:$("adminPassword").value
    });

    roomDialog.close();
    $("roomForm").reset();

    await refreshRooms();
    await enterRoom(id);

  }catch(x){
    notice("作成失敗",x.message);
  }
});

$("joinMode").onchange=()=>{
  $("accessPasswordWrap").classList.toggle(
    "hidden",
    $("joinMode").value!=="password"
  );
};

$("sendBtn").onclick=()=>{
  sendRoomMessage(
    user,
    currentRoom,
    $("messageInput").value
  )
  .then(()=>$("messageInput").value="")
  .catch(e=>notice("送信失敗",e.message));
};

$("messageInput").addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.shiftKey){
    e.preventDefault();
    $("sendBtn").click();
  }
});

$("searchFriend").onclick=async()=>{
  const rows=await searchUsers($("friendName").value.trim());

  $("friendResults").innerHTML="";

  rows
  .filter(x=>x.id!==user.uid)
  .forEach(x=>{
    const el=document.createElement("div");
    el.className="card";
    el.textContent=x.displayName||x.id;

    const b=document.createElement("button");
    b.className="primary";
    b.textContent="申請";

    b.onclick=()=>requestFriend(user.uid,x.id);

    el.appendChild(b);
    $("friendResults").appendChild(el);
  });
};

$("dmSend").onclick=async()=>{
  if(!currentDM)return;

  try{
    await sendDM(
      user.uid,
      currentDM,
      $("dmInput").value
    );

    $("dmInput").value="";

  }catch(e){
    notice("DM",e.message);
  }
};

$("saveSettings").onclick=async()=>{
  await saveProfile(user.uid,{
    displayName:$("displayName").value.trim()||"User",
    plateColor:$("plateColor").value,
    font:$("fontName").value,
    onlineVisible:$("onlineVisibility").value==="visible",
    status:$("status").value,
    dmPolicy:$("dmPolicy").value
  });

  await loadSettings();

  notice("保存","設定を保存しました");
};

// GitHub連携
$("linkGithub").onclick=async()=>{
  try{
    await linkGithub();
    await loadSettings();
    notice("GitHub","GitHubを連携しました");
  }catch(e){
    notice("GitHub",e.message);
  }
};

$("discordLinkInfo").onclick=()=>{
  notice(
    "Discord連携",
    "開発中"
  );
};

$("robloxLinkInfo").onclick=()=>{
  notice(
    "Roblox連携",
    "開発中"
  );
};

$("enablePush").onclick=async()=>{
  try{
    const t=await enablePush();

    $("pushState").textContent="有効化済み";

    console.log("FCM token",t);

  }catch(e){
    notice("通知",e.message);
  }
};

$("roomSettings").onclick=async()=>{
  if(!currentRoom)return;

  await renderAdmin(
    currentRoom,
    user,
    $("adminPanel")
  );

  adminDialog.showModal();
};

watchAuth(async u=>{
  user=u;

  if(!u){
    $("app").classList.add("hidden");
    $("loginScreen").classList.remove("hidden");
    return;
  }

  $("loginScreen").classList.add("hidden");
  $("app").classList.remove("hidden");

  await ensureProfile(u);
  await loadSettings();

  startPresence(u.uid);

  watchPresence(u.uid,p=>{
    $("presenceDot").style.background=
      p?.state==="online" ? "#43d17c" : "#777";
  });

  if(u.isAnonymous){
    $("topName").textContent="Guest";
  }

  await refreshRooms();

  watchIncoming(u.uid,renderRequests);

  await loadFriends();

  show("home");
});

if("serviceWorker" in navigator){
  navigator.serviceWorker
    .register("./sw.js")
    .catch(console.error);
}