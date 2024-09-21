"use strict";
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const fs = require('fs');

const { Intents, Client } = require('discord.js');
const token = process.env.TOKEN
var channel;


let bot = new Client({
  intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES],
  presence: {
    status: 'online',
    activities: [{
      name: `${process.env["REPL_SLUG"]}.samuelhagen1.repl.co`,
      type: "WATCHING"
    }]
  }
});

bot.on('ready', () => {
  console.log(`Logged in as: ${bot.user.tag}.`)
  //channel = bot.channels.cache.get('880034982041632788');
  channel = bot.channels.cache.get('826102228447526950')
});

bot.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.channel !== channel) return;
  var messageJSON = {username: message.author.username,
                 message: message.content,
                 src:"discord"}
  saveMessage(messageJSON)
  io.emit('message', messageJSON)
});

bot.login(token);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/style.css', (req,res) => {
  res.sendFile(__dirname+'/client/style.css')
});

app.get('/main.js', (req,res) => {
  res.sendFile(__dirname+'/client/main.js')
});

app.post('/messages', (req, res) => {
  var toSend =  `**${req.body.username}**\n${req.body.message}`
  if (toSend.length > 400){
    toSend = toSend.substring(0,400);
  }
  channel.send(toSend);
  saveMessage(req.body);
  io.emit('message', req.body);
});

app.get('/messages', (req, res) => {
  fs.readFile("messages.txt", function (err, data) {
    if (err) {
      return console.error(err);
    }
    res.send(data.toString());
  });
});

io.on('connection', (socket) =>{
  console.log('User connected')
  socket.on('usr-connect', (user) => {
    console.log(user+" joined")
    io.emit('usr-join',`<p class="sys">${user} joined the chat</p>`);
  }); 
});

var server = http.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});


function saveMessage(message){
  fs.appendFile("messages.txt",JSON.stringify(message)+"\n", function(error){
    if (error){
      console.warn(error);
    }
    console.log("Message Saved");
  });
}