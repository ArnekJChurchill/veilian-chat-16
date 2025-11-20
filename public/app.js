const pusher = new Pusher('b7d05dcc13df522efbbc', { cluster: 'us2' });
const channel = pusher.subscribe('veilian-chat');
channel.bind('new-message', data => addMessage(data.displayName, data.message, data.avatar, data.username));

// DOM
const loginBox = document.getElementById('loginBox');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeChatBtn = document.getElementById('closeChat');
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const adminPanel = document.getElementById('adminPanel');
const banUsernameInput = document.getElementById('banUsername');
const banBtn = document.getElementById('banBtn');
const unbanBtn = document.getElementById('unbanBtn');
const bannedListDiv = document.getElementById('bannedList');

const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.querySelector('.closeProfile');
const profileAvatar = document.getElementById('profileAvatar');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const profileJoinDate = document.getElementById('profileJoinDate');

let currentUser = '';
let isModerator = false;

// LOGIN
loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if(!username||!password)return alert("Fill both fields");
  const res = await fetch('/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})});
  const data = await res.json();
  if(data.success){
    currentUser=username;
    isModerator=data.isModerator;
    loginBox.style.display='none';
    chatContainer.style.display='block';
    if(isModerator){ adminPanel.style.display='block'; fetchBannedList(); alert("Moderator logged in!"); }
  } else { alert(data.message||"Login failed"); }
});

// SIGNUP
signupBtn.addEventListener('click', async ()=>{
  const username=usernameInput.value.trim();
  const password=passwordInput.value.trim();
  if(!username||!password)return alert("Fill both fields");
  const res = await fetch('/signup',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})});
  const data = await res.json();
  if(data.success)alert("Signup successful! Please log in."); else alert(data.message||"Signup failed");
});

// SEND MESSAGE
sendBtn.addEventListener('click',sendMessage);
messageInput.addEventListener('keypress',e=>{if(e.key==="Enter")sendMessage();});
function sendMessage(){
  const msg=messageInput.value.trim();
  if(!msg)return;
  fetch('/send',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({displayName:currentUser,message:msg})});
  messageInput.value='';
}

// ADD MESSAGE
function addMessage(name,msg,avatar,username){
  const msgDiv=document.createElement('div');
  msgDiv.classList.add('message');
  const avatarImg=document.createElement('img');
  avatarImg.src=avatar||'avatars/default.png';
  avatarImg.classList.add('circular-avatar');
  const nameSpan=document.createElement('span');
  nameSpan.textContent=name;
  nameSpan.classList.add('message-name');
  nameSpan.addEventListener('click',()=>openProfile(username));
  const msgSpan=document.createElement('span');
  msgSpan.textContent=": "+msg;
  msgDiv.appendChild(avatarImg);
  msgDiv.appendChild(nameSpan);
  msgDiv.appendChild(msgSpan);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop=chatBox.scrollHeight;
}

// CLOSE CHAT
closeChatBtn.addEventListener('click',()=>{ chatContainer.style.display='none'; loginBox.style.display='block'; });

// MODERATOR: BAN/UNBAN
banBtn.addEventListener('click', async ()=>{
  const banUser=banUsernameInput.value.trim();
  if(!banUser)return alert("Enter username");
  await fetch('/ban',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:banUser})});
  fetchBannedList();
});
unbanBtn.addEventListener('click', async ()=>{
  const unbanUser=banUsernameInput.value.trim();
  if(!unbanUser)return alert("Enter username");
  await fetch('/unban',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:unbanUser})});
  fetchBannedList();
});
async function fetchBannedList(){
  const res=await fetch('/banned'); const data=await res.json();
  bannedListDiv.innerHTML="Banned Users: "+(data.banned.join(", ")||"None");
}

// PROFILE MODAL
function openProfile(username){
  fetch('/profile/'+username).then(r=>r.json()).then(data=>{
    profileAvatar.src=data.avatar||'avatars/default.png';
    profileDisplayName.textContent=data.displayName;
    profileUsername.textContent=data.username;
    profileBio.textContent=data.bio||"";
    profileJoinDate.textContent="Joined: "+new Date(data.joinDate).toLocaleDateString();
    profileModal.style.display='flex';
  });
}
closeProfileBtn.addEventListener('click',()=>{ profileModal.style.display='none'; });

