const socket = io();

var username = prompt("What is your username?")
if (username == null || username.trim() == ""){
  username = "Unnamed User";
}
username = username.trim();
socket.emit('usr-connect',username);

function element(id){
  return document.getElementById(id);
}

getMessages();
  
element("send").onclick = function(){
  sendMessage();
}

element("message").onkeypress = function(key){
  if (key.code === 'Enter'){
    sendMessage();
  }
}

    
function addMessage(message){
  var username = document.createElement("h4")
  username.innerText = message.username;
  if (message.src === "discord"){
    username.classList.add("discord")
  }
  var content = document.createElement("p")
  content.innerText = message.message;
  element("messageArea").appendChild(username);
  element("messageArea").appendChild(content);
  window.scrollTo(0,document.body.scrollHeight);
}

function addNotification(message){
  element("messageArea").innerHTML += message;
  window.scrollTo(0,document.body.scrollHeight);
}
   
function getMessages(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:
      var messages = xhttp.responseText.split("\n");
      for (i in messages){
        addMessage(JSON.parse(messages[i]));
      }
    }
  };
  xhttp.open("GET", "/messages", true);
  xhttp.send();
}
 
function sendMessage(){
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/messages", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send(`username=${username}&message=${element("message").value}&src=site`);
  element("message").value = "";
}

socket.on('message', addMessage);
socket.on('usr-join', addNotification);