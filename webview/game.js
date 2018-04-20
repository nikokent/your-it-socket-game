
var socket = io();

socket.emit('new player');

setInterval(function() { // Updatefunction
    if(movement.left || movement.right || movement.down || movement.up){
        socket.emit('movement', movement);
    }
}, 1000 / 30);

socket.on('message', function(data) {
  console.log(data);
});

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
  }
  document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = true;
        break;
      case 87: // W
        movement.up = true;
        break;
      case 68: // D
        movement.right = true;
        break;
      case 83: // S
        movement.down = true;
        break;
    }
  });
  document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
      case 65: // A
        movement.left = false;
        break;
      case 87: // W
        movement.up = false;
        break;
      case 68: // D
        movement.right = false;
        break;
      case 83: // S
        movement.down = false;
        break;
    }
  });

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on("refresh", function(){
    alert("You went out of bounds, please refresh the game!");
});
socket.on("tagged", function(){
    //alert("Tag you're it!");
    movement.left = false
    movement.right = false
    movement.up = false
    movement.down = false
});
socket.on('state', function(players) {
  context.clearRect(0, 0, 800, 600);
  context.fillStyle = 'green';
  for (var id in players) {
    var player = players[id];
    if(player.tag == true){
        context.fillStyle = 'red';
    }
    else{
        context.fillStyle = 'green';
    }
    context.beginPath();
    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
    context.fill();
  }
});