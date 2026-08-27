import {openRoomInfo,listMembers,banMember,unbanMember,approveMember} from "./rooms.js";
export async function renderAdmin(roomId,user,container){
  const room=await openRoomInfo(roomId);
  if(!room||room.ownerUid!==user.uid){container.innerHTML="<p>管理者のみ利用できます。</p>";return;}
  const members=await listMembers(roomId);
  container.innerHTML="<p class='muted'>ルーム所有者が管理者です。</p>";
  for(const m of members){
    const row=document.createElement("div");row.className="card";
    row.innerHTML=`<div class="row-between"><b>${m.uid}</b><span>${m.banned?"BAN中":"参加中"}</span></div>`;
    const btn=document.createElement("button");btn.className=m.banned?"secondary":"danger";btn.textContent=m.banned?"BAN解除":"BAN";
    btn.onclick=async()=>{m.banned?await unbanMember(roomId,m.uid):await banMember(roomId,m.uid);await renderAdmin(roomId,user,container)};
    row.appendChild(btn);container.appendChild(row);
  }
}
