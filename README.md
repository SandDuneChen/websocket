## WebSocket入门及示例
### 1 WebSocket简介
参考[使用Node.js+Socket.IO搭建WebSocket实时应用](http://www.jianshu.com/p/d9b1273a93fd)

### 2 WebSocket API
WebSocket包括网络而协议和API，API使你可以建立一个客户端和服务端的WebSocket连接，并且通过API接口，使得应用可以使用WebSocket协议。
要连接远程服务器，只需要创建一个WebSocket对象实体，并传入一个服务端的URL。在客户端和服务端一开始握手（handshake）的期间，http协议升级到WebSocket协议就建立了连接，底层都是TCP协议。一旦建立连接，通过WebSocket接口可以反复的发送消息。在你的应用里面，你可以使用异步事件监听连接生命周期的每个阶段。WebSocket API是纯事件驱动，一旦建立全双工连接，当服务端给客户端发送数据或者资源，它能自动发送状态改变的数据和通知。所以你不需要为了状态的更新而去轮训Server，在客户端监听即可。
#### 2.1 WebSocket 构造器
WebSocket构造器有一个必填的URL参数和一个可选的协议参数：
```javascript
var WebSocket = require('ws');
// Create new WebSocket Connection
var ws = new WebSocket("ws://www.websocket.org");

// Connecting to the server with one protocol called myProtocol
var ws = new WebSocket("ws://echo.websocket.org", "myProtocol");

// Connecting to the server with multiple protocol choices
var echoSocket = new
WebSocket("ws://echo.websocket.org", ["com.kaazing.echo", "example.imaginary.protocol"]);

echoSocket.onopen = function(e) {
  // Check the protocol chosen by the server
  console.log(echoSocket.protocol);
}
```
#### 2.2 WebSocket Events
1. open: 一旦服务端响应了客户端WebSocket连接请求，将会触发open事件并建立连接
```javascript
// Event handler for the WebSocket connection opening
ws.onopen = function(e) {
   console.log("Connection open...");
};
```
2. message: message包含来自于服务端的数据，当收到消息时触发message事件onmessage
```javascript
// Event handler for receiving text messages
ws.onmessage = function(e) {
   if(typeof e.data === "string"){
      console.log("String message received", e, e.data);
   } else {
      console.log("Other message received", e, e.data);
  }
};

// Set binaryType to blob (Blob is the default.)
ws.binaryType = "blob";
// Event handler for receiving Blob messages
ws.onmessage = function(e) {
   if(e.data instanceof Blob) {
      console.log("Blob message received", e.data);
      var blob = new Blob(e.data);
  }
};

// Set binaryType to ArrayBuffer messages
ws.binaryType = "arraybuffer";
// Event handler for receiving ArrayBuffer messages
ws.onmessage = function(e) {
   if(e.data instanceof ArrayBuffer){
      console.log("ArrayBuffer Message Received", + e.data);
      // e.data is an ArrayBuffer. Create a byte view of that object.
      var a = new Uint8Array(e.data);
  }
};
```
3. error: error事件用于响应未知异常，对应的回调是onerror
```javascript
// Event handler for errors in the WebSocket object
ws.onerror = function(e) {
   console.log("WebSocket Error: " , e);
   //Custom function for handling errors
   handleErrors(e);
};
```
4. close： 当WebScoket连接关闭时触发，对应的回调是onclose
```javascript
// Event handler for closed connections
ws.onclose = function(e) {
   console.log("Connection closed", e);
};
```
close事件有三个有用的属性：
* wasClean：表明服务器是否干净地关闭
* code：
* reason: code和reason属性指示服务端发送的关闭握手的状态

#### 2.3 WebSocket方法
1. send(): 一旦在服务端和客户端建立了全双工的双向连接，可以使用send方法去发送消息
```javascript
// Send a text message
ws.send("Hello WebSocket!");

// Send a Blob
var blob = new Blob("blob contents");
ws.send(blob);
// Send an ArrayBuffer
var a = new Uint8Array([8,6,7,5,3,0,9]);
ws.send(a.buffer);
```
如果想通过响应别的事件去发送消息，可以检查readyState属性的值为open的时候来实现。
```javascript
// Handle outgoing data. Send on a WebSocket if that socket is open.
function myEventHandler(data) {
   if (ws.readyState === WebSocket.OPEN) {
      // The socket is open, so it is ok to send the data.
      ws.send(data);
   } else {
      // Do something else in this case.
      //Possibly ignore the data or enqueue it.
  }
}
```
2. close(): 关闭WebSocket连接或终止尝试连接。如果WebSocket已是关闭状态，则这个方法什么都不做，调用close()方法之后，你将不能在已关闭的连接上再发送数据。调用close()方法时可以传递两个可选的参数:code（数值型的状态值）和reason（文本字符串）以告诉服务器关闭连接的原因。
```javascript
// Close the WebSocket connection
ws.close();

// Close the WebSocket connection because the session has ended successfully
ws.close(1000, "Closing normally");
```

#### 2.4 WebScoket对象属性
1. readyState: 只读，报告连接状态
* WebSocket.CONNECTING 0 连接正在建立
* WebSocket.OPEN 1 连接已建立，可以在客户端和服务端发送消息
* WebSocket.CLOSING 2 连接正在进行关闭握手
* WebSocket.CLOSED 3 连接已关闭或不能打开
2. bufferAmount: 已经进入队列但还未被传输的数据大小
```javascript
// 10k max buffer size.
var THRESHOLD = 10240;
// Create a New WebSocket connection
var ws = new WebSocket("ws://echo.websocket.org/updates");
// Listen for the opening event
ws.onopen = function () {
   // Attempt to send update every second.
   setInterval( function() {
      // Send only if the buffer is not full
      if (ws.bufferedAmount < THRESHOLD) {
         ws.send(getApplicationState());
      }
    }, 1000);
};
```
3. protocol： 在构造函数中，protocol参数让服务端知道客户端使用的WebSocket协议。而WebSocket对象的这个属性就是指的最终服务端确定下来的协议名称，当服务端没有选择客户端提供的协议或者在连接握手结束之前，这个属性都是空的。

#### 2.5 一些例子
1. echo client
这个例子使用WebSocket API与一个Web Echo Server通讯，这个Server可以接收消息并原样返回接收的消息。这个Server的地址是："ws://echo.websocket.org/echo"， 代码见echo/index.html

2. hello server

3. cryto quotes

4. chat room
