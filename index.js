const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require('fs');
var  lineLog = []; // array of lines drawn

var filePath = '/public/images/morningbreak.jpg';

// directories with static files
app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data)); 
  // save line history
  // broadcast line history to user that just connected
  console.log("A user has connected!");
  // read file name
  fs.readFile(__dirname + filePath, function(err, buffer){
    socket.emit('image', { buffer: buffer });
    console.log('Image put into buffer');
	});

  socket.on('imaged', function(dataUrl){
  	//console.log(dataUrl);
  	var base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  	//console.log(imageBuffer);
  	fs.writeFile("public/images/out.png", base64Data, 'base64', function(err) {
  	console.log('Saved!')
   	});

   	filePath = '/public/images/out.png';

  });

  socket.on('reload', function(){
  	 fs.readFile(__dirname + filePath, function(err, buffer){
    socket.emit('image', { buffer: buffer });
    console.log('Image put into buffer');
	});
  });

}
io.on('connection', onConnection);


http.listen(port, () => console.log('listening on port ' + port));
