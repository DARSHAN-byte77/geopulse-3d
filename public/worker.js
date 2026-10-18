let buffer = [];
const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new WebSocket(`${protocol}//${location.host}`);

ws.onmessage = (event) => {
  buffer.push(JSON.parse(event.data));
};

setInterval(() => {
  if (buffer.length > 0) {
    postMessage(buffer);
    buffer = [];
  }
}, 16);