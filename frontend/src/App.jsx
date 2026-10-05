import { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import MessagesArea from './components/MessagesArea';
import MessageComposer from './components/MessageComposer';
import TypingIndicator from './components/TypingIndicator';
import { useSocket } from './hooks/useSocket';
import { getMessages, getFriendlyError } from './services/api';
import { isConfigured, configError } from './services/config';

const USERNAME_KEY = 'pokichat_username';
const LEGACY_USERNAME_KEY = 'pulsechat_username';

const ConfigErrorScreen = () => (
  <div className="login-screen">
    <div className="login-card">
      <h1 className="logo-text">PokiChat</h1>
      <p className="error-text">{configError}</p>
      <p className="logo-subtitle">
        Set VITE_API_URL and VITE_SOCKET_URL in <code>frontend/.env</code>, then rebuild.
      </p>
    </div>
  </div>
);

const App = () => {
  const [username, setUsername] = useState(
    () => localStorage.getItem(USERNAME_KEY) || localStorage.getItem(LEGACY_USERNAME_KEY)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    isConnected,
    isConnecting,
    connectionError,
    messageError,
    reconnectCount,
    onlineUsers,
    typingUsers,
    messages,
    connect,
    disconnect,
    retry,
    sendMessage,
    startTyping,
    stopTyping,
    setInitialMessages,
  } = useSocket(username);

  const connectionStatus = isConnecting
    ? 'connecting'
    : isConnected
      ? 'connected'
      : 'disconnected';

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMessages();
      if (response.success) {
        setInitialMessages(response.data);
        setError(null);
      } else {
        setError('Server connection unavailable. Please try again.');
      }
    } catch (err) {
      setError(getFriendlyError(err));
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setInitialMessages]);

  useEffect(() => {
    if (username && isConfigured) {
      connect();
      loadMessages();
    }
  }, [username, connect, loadMessages]);

  useEffect(() => {
    if (reconnectCount > 0 && username) {
      loadMessages();
    }
  }, [reconnectCount, username, loadMessages]);

  const handleLogin = (name) => {
    localStorage.setItem(USERNAME_KEY, name);
    localStorage.removeItem(LEGACY_USERNAME_KEY);
    setUsername(name);
  };

  const handleLogout = () => {
    disconnect();
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(LEGACY_USERNAME_KEY);
    setUsername(null);
    setInitialMessages([]);
    setError(null);
  };

  const handleSend = (text) => {
    sendMessage(text);
  };

  const handleRetry = () => {
    retry();
    loadMessages();
  };

  if (!isConfigured) {
    return <ConfigErrorScreen />;
  }

  if (!username) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const emptyStateError = messages.length === 0 ? error : null;
  const bannerError =
    messageError || connectionError || (messages.length > 0 ? error : null);

  return (
    <div className="chat-container">
      <Header
        username={username}
        onlineUsers={onlineUsers}
        connectionStatus={connectionStatus}
        onLogout={handleLogout}
      />

      {bannerError && (
        <div className="status-banner" role="alert">
          <span className="status-banner-text">{bannerError}</span>
          <button type="button" className="btn-retry" onClick={handleRetry}>
            Retry
          </button>
        </div>
      )}

      <MessagesArea
        messages={messages}
        currentUser={username}
        isLoading={isLoading}
        error={emptyStateError}
        onRetry={handleRetry}
      />
      <TypingIndicator typingUsers={typingUsers} currentUser={username} />
      <MessageComposer
        onSend={handleSend}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        disabled={!isConnected}
      />
    </div>
  );
};

export default App;
