var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.port || 5000;

app.use('/webview', express.static(__dirname + '/webview'));

app.get('/',function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(port,function(){
    console.log("App has started with port: ", port);
});

var canTag = true;

var timedTag = function(){
    setTimeout(function(){
        canTag = true;
    }, 350);
};

var players = {};
io.sockets.on('connection', function(socket) {
  socket.on('new player', function() {
    console.log(players);
    players[socket.id] = {
      x: 300,
      y: 300,
      tag: true
    };
    Object.keys(players).forEach(function(key) {
        if(key!=socket.id){
            players[key].tag = false;
        }
    });
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
    if(player.x < 0 || player.x > 800 || player.y < 0 || player.y > 600){
        delete players[socket.id];
        socket.emit("refresh");
    }

    Object.keys(players).forEach(function(key) {
        if(key != socket.id && canTag == true){
            if (player.x >= players[key].x && player.x <= players[key].x + 10){
                if(player.y >= players[key].y && player.y <= players[key].y + 10){
                    console.log("CRASH!!!");
                    if(player.tag == true){
                        player.tag = false;
                        players[key].tag = true;
                        console.log(String(key) + " was tagged! yayaya");
                        canTag = false;
                        timedTag();
                        socket.emit("tagged");
                    }
                    else if(players[key].tag == true){
                        players[key].tag = false;
                        player.tag = true;
                        console.log(String(key) + " was tagged!");
                        canTag = false;
                        timedTag();
                        socket.emit("tagged");
                    }
                }
            }
        }
    });

    socket.on('disconnect', function(){
        delete players[socket.id];
    });

  });
});
setInterval(function() {
  io.sockets.emit('state', players);
}, 1000 / 60);