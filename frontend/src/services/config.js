const DEV_API_URL = 'http://localhost:5000/api';
const DEV_SOCKET_URL = 'http://localhost:5000';

const read = (value) => (typeof value === 'string' ? value.trim() : '');

const isPlaceholder = (value) =>
  !value || /YOUR[_-]?BACKEND[_-]?URL|example\.com|<[^>]+>/i.test(value);

const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

const ensureApiPath = (url) => {
  const base = stripTrailingSlash(url);
  return /\/api$/i.test(base) ? base : `${base}/api`;
};

const stripApiPath = (url) => stripTrailingSlash(url).replace(/\/api$/i, '');

const rawApi = read(import.meta.env.VITE_API_URL);
const rawSocket = read(import.meta.env.VITE_SOCKET_URL);

const isDev = import.meta.env.DEV === true;

const API_URL = isPlaceholder(rawApi)
  ? isDev
    ? DEV_API_URL
    : ''
  : ensureApiPath(rawApi);

const derivedSocket = API_URL ? stripApiPath(API_URL) : '';

const SOCKET_URL = isPlaceholder(rawSocket)
  ? isDev
    ? DEV_SOCKET_URL
    : derivedSocket
  : stripApiPath(rawSocket);

const isHttpsPage =
  typeof window !== 'undefined' && window.location.protocol === 'https:';

const isMixedContent =
  !isDev && isHttpsPage && /^http:/i.test(`${API_URL} ${SOCKET_URL}`);

const isConfigured = Boolean(API_URL && SOCKET_URL) && !isMixedContent;

const configError = isConfigured
  ? null
  : isMixedContent
    ? 'Server address must use https:// — browsers block insecure (http) connections from this site.'
    : 'Server address is not configured. Set VITE_API_URL and VITE_SOCKET_URL before building.';

if (!isConfigured && import.meta.env.DEV) {
  console.warn(`[PokiChat] ${configError}`);
}

export { API_URL, SOCKET_URL, isConfigured, configError, isDev };
