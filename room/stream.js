const socket = new SimpleSocket({
  project_id: "61c066e1fd8acdbeec4c6dc2",
  project_token: "client_a364b2bdfacbab087099042f923a6b683e0"
});

const roomCode = location.href.slice(location.href.indexOf("#") + 1);

let username = localStorage.getItem("username");
if (!username) {
  username = prompt("Enter Username");
  localStorage.setItem("username", username);
}

socket.setDefaultConfig({ publishToSelf: false });

//Video Compression
function encode(c) { var x = 'charCodeAt', b, e = {}, f = c.split(""), d = [], a = f[0], g = 256; for (b = 1; b < f.length; b++)c = f[b], null != e[a + c] ? a += c : (d.push(1 < a.length ? e[a] : a[x](0)), e[a + c] = g, g++, a = c); d.push(1 < a.length ? e[a] : a[x](0)); for (b = 0; b < d.length; b++)d[b] = String.fromCharCode(d[b]); return d.join("") }
function decode(b) { var a, e = {}, d = b.split(""), c = f = d[0], g = [c], h = o = 256; for (b = 1; b < d.length; b++)a = d[b].charCodeAt(0), a = h > a ? d[b] : e[a] ? e[a] : f + c, g.push(a), c = a.charAt(0), e[o] = f + c, o++, f = a; return g.join("") }

const startStreamCameraButton = document.getElementById("startStreamCamera");
const startStreamScreenButton = document.getElementById("startStreamScreen");
const output = document.getElementById("output");
const data = document.getElementById("data");
const stream = document.getElementById("stream");
const streamUsername = document.getElementById("streamUsername");


const waiting = "Waiting For Stream | " + roomCode;
document.title = waiting;

const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

//Claim Room
let streamOutput;
let compression = 0.5;

startStreamCameraButton.addEventListener('click', async function () {
  streamOutput = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  startStream();
});
startStreamScreenButton.addEventListener('click', async function () {
  streamOutput = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
  compression = 1;
  startStream();
});

function startStream() {
  output.srcObject = streamOutput;
  document.title = "Brodcasting Stream | " + roomCode;
  streamUsername.innerText = username;
  setInterval(function () {
      data.getContext('2d').drawImage(output, 0, 0, data.width, data.height);
      let frame = data.toDataURL('image/jpeg', compression);
      stream.src = frame;

      socket.publish({ s: roomCode, t: "f" }, { f: encode(frame), u: username });
  }, 128);
  startStreamCameraButton.remove();
  startStreamScreenButton.remove();
}

//Load Frame
let lastFrame;

socket.subscribe({ s: roomCode, t: "f" }, function (d) {
  if (d.f) {
    stream.src = decode(d.f);
  }
  if (startStreamCameraButton) {
    startStreamCameraButton.remove();
    startStreamScreenButton.remove();
  }
  if (document.title == waiting) {
    document.title = "Watching Stream | " + roomCode;
  }
  if (streamUsername.innerText != d.u) {
    streamUsername.innerText = d.u;
  }
  lastFrame = new Date().getTime()
})

//Chats
const chatInput = document.getElementById("chatInput");
const chats = document.getElementById("chats");

function createChat(message, username, color) {
  let chat = document.createElement("span");
  chat.innerHTML = `<b style="color:${color.slice(0,7)}">${username.replace(/</g, "&lt;")}</b> – ${message.replace(/</g, "&lt;")}`
  chats.appendChild(chat);
  let linebreak = document.createElement("br");
  chats.appendChild(linebreak);
  chats.scrollTop = chats.scrollHeight;
}

chatInput.addEventListener("keydown", function (event) {
  if (event.key == "Enter" && chatInput.value.replace(/\s/g, "").length > 0) {
    socket.publish({ s: roomCode, t: "c" }, { u: username, c: color, m: chatInput.value });
    createChat(chatInput.value, username, color);
    chatInput.value = "";
  }
})

socket.subscribe({ s: roomCode, t: "c" }, function (d) {
  createChat(d.m, d.u, d.c);
})
