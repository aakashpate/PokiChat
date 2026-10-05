const { io } = require('socket.io-client');

const URL = process.env.TEST_URL || 'http://localhost:5000';
const ORIGIN = process.env.TEST_ORIGIN || 'https://aakashpate.github.io';

const results = [];
const log = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`);
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const httpGet = (path, origin = ORIGIN) =>
  new Promise((resolve, reject) => {
    const http = require('http');
    const req = http.get(`${URL}${path}`, { headers: origin ? { Origin: origin } : {} }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () =>
        resolve({ status: res.statusCode, headers: res.headers, body: data })
      );
    });
    req.on('error', reject);
  });

const httpPost = (path, payload) =>
  new Promise((resolve, reject) => {
    const http = require('http');
    const body = JSON.stringify(payload);
    const req = http.request(
      `${URL}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          Origin: ORIGIN,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

const preflight = (path, method) =>
  new Promise((resolve, reject) => {
    const http = require('http');
    const req = http.request(
      `${URL}${path}`,
      {
        method: 'OPTIONS',
        headers: {
          Origin: ORIGIN,
          'Access-Control-Request-Method': method,
          'Access-Control-Request-Headers': 'content-type',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });

const uploadImage = async (bytes, mime, filename) => {
  const form = new FormData();
  form.append('image', new Blob([bytes], { type: mime }), filename);
  const res = await fetch(`${URL}/api/messages/upload`, {
    method: 'POST',
    headers: { Origin: ORIGIN },
    body: form,
  });
  return { status: res.status, json: await res.json() };
};

const makeClient = (username) =>
  new Promise((resolve, reject) => {
    const socket = io(URL, {
      extraHeaders: { Origin: ORIGIN },
      transports: ['websocket', 'polling'],
      reconnection: false,
      timeout: 8000,
    });
    const state = { socket, username, received: [], reactions: [], typing: [], online: null, errors: [] };
    const timer = setTimeout(() => reject(new Error(`${username} connect timeout`)), 8000);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.emit('join_chat', username);
      resolve(state);
    });
    socket.on('connect_error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    socket.on('receive_message', (m) => state.received.push(m));
    socket.on('reaction_toggled', (r) => state.reactions.push(r));
    socket.on('online_users', (n) => (state.online = n));
    socket.on('typing_start', (p) => state.typing.push(`start:${p.username}`));
    socket.on('typing_stop', (p) => state.typing.push(`stop:${p.username}`));
    socket.on('message_error', (p) => state.errors.push(p.message));
  });

(async () => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  try {
    const health = await httpGet('/api/health');
    const h = JSON.parse(health.body);
    log('health endpoint', health.status === 200 && h.success === true, health.body);
    log('health reports db mode', typeof h.database === 'string', `database=${h.database}`);

    const pf = await preflight('/api/messages/upload', 'POST');
    log(
      'upload preflight allowed',
      pf.status === 204 && !!pf.headers['access-control-allow-origin'],
      `status=${pf.status} acao=${pf.headers['access-control-allow-origin']}`
    );

    const badUpload = await uploadImage('not-an-image', 'text/plain', 'x.txt');
    log('rejects non-image upload', badUpload.status === 400, JSON.stringify(badUpload.json));

    const upload = await uploadImage(png, 'image/png', 'pixel.png');
    log(
      'accepts image upload',
      upload.status === 200 && upload.json?.data?.imageUrl?.startsWith('/uploads/'),
      JSON.stringify(upload.json)
    );

    const imageUrl = upload.json.data.imageUrl;
    const imageFetch = await httpGet(imageUrl);
    log(
      'serves uploaded image',
      imageFetch.status === 200 && (imageFetch.headers['content-type'] || '').includes('image'),
      `status=${imageFetch.status} type=${imageFetch.headers['content-type']}`
    );

    const pre = JSON.parse((await httpGet('/api/messages')).body);
    const before = pre.data.length;

    const a = await makeClient('Alice');
    const b = await makeClient('Bob');
    log('two clients connect', true);
    await wait(500);
    log('online users = 2', a.online === 2 && b.online === 2, `a=${a.online} b=${b.online}`);

    a.socket.emit('send_message', { username: 'Alice', text: 'hello from Alice' });
    await wait(600);
    log('text message delivered', b.received.some((m) => m.text === 'hello from Alice'));

    a.socket.emit('send_message', {
      username: 'Alice',
      text: 'here is a pic',
      type: 'image',
      imageUrl,
    });
    await wait(600);
    const imageMsg = b.received.find((m) => m.type === 'image');
    log('image message delivered', !!imageMsg, imageMsg ? JSON.stringify(imageMsg) : 'missing');
    log('image message carries reactions field', imageMsg && typeof imageMsg.reactions === 'object');

    a.socket.emit('send_message', {
      username: 'Alice',
      text: '',
      type: 'image',
      imageUrl: '/uploads/hack.png',
    });
    await wait(400);
    log('rejects un-uploaded image path', b.received.every((m) => m.imageUrl !== '/uploads/hack.png'));

    if (imageMsg) {
      a.socket.emit('toggle_reaction', {
        messageId: imageMsg._id,
        username: 'Alice',
        emoji: 'love',
      });
      await wait(600);
      const toggled = b.reactions.find((r) => r._id === imageMsg._id);
      log('reaction broadcast', toggled && toggled.reactions?.Alice === 'love', JSON.stringify(toggled));

      a.socket.emit('toggle_reaction', {
        messageId: imageMsg._id,
        username: 'Bob',
        emoji: 'laugh',
      });
      await wait(600);
      const second = b.reactions[b.reactions.length - 1];
      log(
        'second user reaction merges',
        second && second.reactions?.Alice === 'love' && second.reactions?.Bob === 'laugh',
        JSON.stringify(second?.reactions)
      );

      a.socket.emit('toggle_reaction', {
        messageId: imageMsg._id,
        username: 'Alice',
        emoji: 'love',
      });
      await wait(600);
      const third = b.reactions[b.reactions.length - 1];
      log('same reaction toggles off', third && !third.reactions?.Alice, JSON.stringify(third?.reactions));

      a.socket.emit('toggle_reaction', {
        messageId: imageMsg._id,
        username: 'Alice',
        emoji: 'rocket',
      });
      await wait(500);
      log('invalid emoji rejected', a.errors.includes('Invalid emoji type'), JSON.stringify(a.errors));
    }

    a.socket.emit('typing_start');
    await wait(400);
    log('typing indicator', b.typing.includes('start:Alice'));
    a.socket.emit('typing_stop');
    await wait(400);
    log('typing stop', b.typing.includes('stop:Alice'));

    const post = await httpPost('/api/messages', { username: 'Bob', text: 'via REST' });
    log('REST create message', post.status === 201, post.body);

    const history = JSON.parse((await httpGet('/api/messages')).body);
    log('history grew', history.data.length > before, `before=${before} after=${history.data.length}`);
    log('no duplicate ids', new Set(history.data.map((m) => m._id)).size === history.data.length);
    log('history has image message', history.data.some((m) => m.type === 'image' && m.imageUrl));

    b.socket.disconnect();
    await wait(600);
    log('online drops after disconnect', a.online === 1, `a=${a.online}`);
    a.socket.disconnect();

    const blocked = await new Promise((resolve) => {
      const s = io(URL, {
        extraHeaders: { Origin: 'https://evil.example.com' },
        reconnection: false,
        timeout: 5000,
      });
      s.on('connect', () => resolve(false));
      s.on('connect_error', () => resolve(true));
      setTimeout(() => resolve(false), 6000);
    });
    log('bad origin blocked', blocked);
  } catch (err) {
    log('unexpected error', false, err.message);
  }

  const failed = results.filter((r) => !ok(r)).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

function ok(r) {
  return r.ok;
}
