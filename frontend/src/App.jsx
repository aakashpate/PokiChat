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
  const [replyTo, setReplyTo] = useState(null);

  const {
    messages,
    onlineUsers,
    connectionStatus,
    typingUsers,
    loading,
    error,
    sendMessage,
    sendImageMessage,
    sendReply,
    editMessage,
    deleteMessage,
    toggleReaction,
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

  const handleReply = (msg) => {
    setReplyTo({ _id: msg._id, username: msg.username, text: msg.text, type: msg.type, imageUrl: msg.imageUrl });
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
          onReply={handleReply}
          onEdit={editMessage}
          onDelete={deleteMessage}
          onReact={toggleReaction}
        />
        <TypingIndicator users={typingUsers} />
        <MessageComposer
          onSend={sendMessage}
          onSendImage={sendImageMessage}
          onSendReply={sendReply}
          onTyping={startTyping}
          onStopTyping={stopTyping}
          disabled={connectionStatus !== 'connected'}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </div>
    </div>
  );
};

export default App;
