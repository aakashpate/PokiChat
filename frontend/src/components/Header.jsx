const Header = ({ username, onlineUsers, connectionStatus, onLogout }) => {
  const statusLabel = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
  };

  const statusClass = {
    connected: 'status-connected',
    connecting: 'status-connecting',
    disconnected: 'status-disconnected',
  };

  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="header-logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#6366f1" />
            <path
              d="M14 20C14 17.7909 15.7909 16 18 16H30C32.2091 16 34 17.7909 34 20V26C34 28.2091 32.2091 30 30 30H26L21 34V30H18C15.7909 30 14 28.2091 14 26V20Z"
              fill="white"
            />
            <circle cx="20" cy="23" r="1.5" fill="#6366f1" />
            <circle cx="24" cy="23" r="1.5" fill="#6366f1" />
            <circle cx="28" cy="23" r="1.5" fill="#6366f1" />
          </svg>
          <span className="header-brand">PokiChat</span>
        </div>
      </div>

      <div className="header-center">
        <div className={`connection-status ${statusClass[connectionStatus]}`}>
          <span className="status-dot"></span>
          <span className="status-text">{statusLabel[connectionStatus]}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="online-indicator">
          <span className="online-dot"></span>
          <span>{onlineUsers} online</span>
        </div>
        <div className="user-badge">
          <span className="user-icon">
            {username.charAt(0).toUpperCase()}
          </span>
          <span className="user-name">{username}</span>
        </div>
        <button onClick={onLogout} className="btn-logout" title="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
