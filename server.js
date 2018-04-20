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
var updateState = false;
io.sockets.on('connection', function(socket) {
  socket.on('new player', function() {
      updateState = true;
    console.log(players);
    players[socket.id] = {
      x: 50 + (600 * Math.random()),
      y: 50 + (450 * Math.random()),
      tag: true
    };
    Object.keys(players).forEach(function(key) {
        if(key!=socket.id){
            players[key].tag = false;
        }
    });
  });
  socket.on('movement', function(data) {
        updateState = true;
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
            if (player.x >= players[key].x - 2 && player.x <= players[key].x + 12){
                if(player.y >= players[key].y - 2&& player.y <= players[key].y + 12){
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
    if(updateState){
        io.sockets.emit('state', players);
        updateState = false;
    }
    
}, 1000 / 30);
