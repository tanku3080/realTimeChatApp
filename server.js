// 各種必要なモジュールをインポート
const express = require('express');
const http = require('http'); // HTTPサーバーを作成するためのモジュール
const { Server } = require('socket.io'); // Socket.ioをインポートし、リアルタイム通信を行えるようにする
const os = require('os'); // ネットワークインターフェースを取得するためのモジュール

// Expressアプリケーションを初期化
const app = express();

// HTTPサーバーを作成し、Expressアプリケーションを渡す
const server = http.createServer(app);

// HTTPサーバーにSocket.ioサーバーを紐付ける
const io = new Server(server);


//-----------------------------------------------------------------//


// ネットワークインターフェースからローカルIPアドレスを取得する関数
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      if (address.family === 'IPv4' && !address.internal) {
        return address.address; // ローカルネットワーク用のIPv4アドレスを返す
      }
    }
  }
  return '127.0.0.1'; // 見つからなければローカルホストを返す
}


//-----------------------------------------------------------------//


// ルートにアクセスされたときに、index.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// クライアントが接続したときに呼び出されるイベントリスナー
io.on('connection', (socket) => {
  console.log('a user connected'); // ユーザーが接続したことを確認

  // クライアントからの「chat message」イベントをリッスンし、メッセージを他の全クライアントに送信
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // 受け取ったメッセージを全クライアントに送信
  });

  // ユーザーが切断したときの処理
  socket.on('disconnect', () => {
    console.log('user disconnected'); // ユーザーが切断したことを確認
  });
});


//-----------------------------------------------------------------//


// // サーバーを3000番ポートでリッスン開始
// server.listen(3000, () => {
//   console.log('listening on *:3000'); // サーバーが起動していることを確認
// });

// 自分のIPアドレスを取得してサーバーを立ち上げる
const localIp = getLocalIp();
const port = 3000;
server.listen(port, localIp, () => {
  console.log(`Server is running at http://${localIp}:${port}`);
});