const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on("connection", function(ws){
  ws.on("message",function(msg){
    var data = JSON.parse(msg);

    if(data.type == "pos"){
      if(ws.clientid) // if they have initted yet
      sendtoall(ws,{
        type: "pos",
        id: ws.clientid,
        username: data.username,
        avatar: data.avatar,
        top: data.top,
        left: data.left,
      });
    }else if(data.type == "init"){
      ws.clientid = data.id;
      ws.username = data.username;
      ws.avatar = data.avatar;
      sendtoall(ws,{
        type: "pos",
        id: ws.clientid,
        top: 0,
        left: 0,
        ping: true,
      });
    }

    //console.log(msg);
  })

  //on onopen
  //ws.on("open",function(){
    //ws.clientid = cid;
    //cid++;
    // sendtoall(ws,{
    //   type: "pos",
    //   id: ws.clientid,
    //   top: 0,
    //   left: 0,
    //   ping: true,
    // });
  //})

  console.log("connected");

  ws.on("close",function(){
    console.log("someone dead");
    sendtoall(ws,{
      type: "dc",
      id: ws.clientid,
    });
  })

})

function sendtoall(ws,data){
  wss.clients.forEach(function e(client){
    data.self = client.clientid === ws.clientid;

    client.send(JSON.stringify(data));
  })
}

console.log("running");
