
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var  lineLog = []; // array of lines drawn

// directory with static files
app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data)); // save line history
  // broadcast line history to user that just connected
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
