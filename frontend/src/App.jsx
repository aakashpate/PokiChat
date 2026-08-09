import { useState } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import MessageList from './components/MessageList';
import MessageComposer from './components/MessageComposer';
import TypingIndicator from './components/TypingIndicator';
import useChat from './hooks/useChat';
import './App.css';

const App = () => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('pulsechat_username') || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('pulsechat_username');
  });

  const {
    messages,
    onlineUsers,
    connectionStatus,
    typingUsers,
    loading,
    error,
    sendMessage,
    startTyping,
    stopTyping,
  } = useChat(isLoggedIn ? username : null);

  const handleLogin = (name) => {
    localStorage.setItem('pulsechat_username', name);
    setUsername(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pulsechat_username');
    setUsername('');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Header
        username={username}
        onlineUsers={onlineUsers}
        connectionStatus={connectionStatus}
        onLogout={handleLogout}
      />
      <div className="chat-area">
        <MessageList
          messages={messages}
          currentUser={username}
          loading={loading}
          error={error}
        />
        <TypingIndicator users={typingUsers} />
        <MessageComposer
          onSend={sendMessage}
          onTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
    </div>
  );
};

export default App;
