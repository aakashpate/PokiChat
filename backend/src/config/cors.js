const DEFAULT_ORIGINS = [
  'https://aakashpate.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const parseOrigins = (raw) =>
  (raw || '')
    .split(',')
    .map((value) => value.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const configuredOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.CLIENT_URLS),
];

const allowedOrigins = [
  ...new Set([...DEFAULT_ORIGINS, ...configuredOrigins]),
];

const isLocalhostOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin) || isLocalhostOrigin(origin);
};

const originVerifier = (origin, callback) => {
  callback(null, isOriginAllowed(origin));
};

const expressCorsOptions = {
  origin: originVerifier,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

const socketCorsOptions = {
  origin: originVerifier,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = {
  allowedOrigins,
  isOriginAllowed,
  expressCorsOptions,
  socketCorsOptions,
};
