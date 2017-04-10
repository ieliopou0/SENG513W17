// client side JS
// Skeleton whiteboard code from socket.io
'use strict';

(function() {
  var url = window.location.hostname;
  var socket = io.connect();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  

  // Get navigation bar elements
  var open = document.getElementById('openLink');
  var save = document.getElementById('saveLink');
  var clear = document.getElementById('clearLink');

  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  // Store the a temporary canvas
  var canvasHx = document.createElement('canvas');
  var contextHx = canvasHx.getContext('2d');

  var current = {
    color: 'black'
  };

  // flag for drawing
  var drawing = false;

  // Manage mouse events
  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  // Manage navigation clicks
  open.addEventListener('click', openImage, false);
  save.addEventListener('click', saveCanvas, false);
  clear.addEventListener('click', clearCanvas, false);

  // Manage touch events
  // From: https://developer.mozilla.org/en/docs/Web/API/Touch_events
  canvas.addEventListener('touchstart', onTouch, false);
  canvas.addEventListener('touchend', onTouch, false);
  canvas.addEventListener('touchcancel', onTouch, false);
  canvas.addEventListener('touchmove', onTouch, false);

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  // Process instructions from server
  socket.on('clear canvas', clearCanvas);
  socket.on('drawing', onDrawingEvent);
  socket.on('image', loadImage);

  window.addEventListener('resize', onResize, false);
  onResize();

  // TO DO - touch event handler
  function onTouch(e){
    var touches = event.changedTouches,
    first = touches[0];
  }

  function sendDrawingToServer(data){
    var img = new Image();
    img.src = canvas.toDataURL(); // returns a PNG
    console.log('img' + img);
    console.log('img src ' + img.src);
    // socket.emit('send-canvas', img);
    console.log('Drawing sent!');
  }

  // TO DO - open image functionality
  function openImage(){
    console.log("Image will open");
  }

  // Loads an image from server
  function loadImage(data){
    // encode into base64
    var uint8Arr = new Uint8Array(data.buffer);
    var binary = '';
    for (var i = 0; i < uint8Arr.length; i++) {
        binary += String.fromCharCode(uint8Arr[i]);
    }
    var base64String = window.btoa(binary);
    // console.log(base64String);
    var img = new Image();
    // load image
    img.onload = function () {
      context.drawImage(img, 0, 0);
    };
    
    img.src = 'data:image/jpeg;base64,' + base64String;

    console.log('Image loaded');
  }

  function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    saveCanvas();
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

  function redraw() {
    console.log("redrawing");
    var imgData = context.getImageData(0,0, canvas.width, canvas.height);
    context.putImageData(imgData, 0, 0);

    /*
    canvasHx.width = canvas.width;
    canvasHx.height = canvas.height;
    contextHx.drawImage(canvas, 0, 0);
    canvas.width = 1000;
    context.drawImage(canvasHx, 0, 0);
    */
  }

  /**
   TO DO 
  */
  function saveCanvas(){
    console.log('Canvas saved!');
    var dataURL = canvas.toDataURL("image/png");
    socket.emit("imaged",dataURL);

    //console.log(dataURL);
    
    //use this to download a png file
    //var download = document.getElementById("download");

     //document.getElementById("download").href = dataURL;


  }

  // clear canvas
  function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear canvas');
  }

  // make the canvas fill its parent
  function onResize() {
    canvasHx.width = canvas.width;
    canvasHx.height = canvas.height;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    contextHx.drawImage(canvas, 0, 0);
    context.drawImage(canvasHx, 0, 0);
    redraw();
    console.log("Canvas resized");
    // context = canvas.getContext('2d');
    // context.onload = function () {
    //   context.drawImage(canvasHx, 0, 0, canvasHx.width, canvasHx.height, 0, 0, canvas.width, canvas.height);
    // };

    /*
    console.log("u resized");
    // set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Save canvas as image data
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    // Copy back
    context.putImageData(imgData, 0, 0);
    // redraw();
    */
  }

})();
