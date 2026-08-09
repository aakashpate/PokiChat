import './Header.css';

const Header = ({ username, onlineUsers, connectionStatus, onLogout }) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#22c55e';
      case 'connecting':
        return '#f59e0b';
      case 'disconnected':
        return '#ef4444';
      default:
        return '#9ca3af';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="header-logo">
          <div className="header-logo-icon">P</div>
          <span className="header-title">PulseChat</span>
        </div>
      </div>
      <div className="header-center">
        <div className="status-badge">
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">{getStatusText()}</span>
        </div>
        <div className="online-badge">
          <span className="online-count">{onlineUsers}</span>
          <span className="online-label">online</span>
        </div>
      </div>
      <div className="header-right">
        <span className="username-display">{username}</span>
        <button className="logout-button" onClick={onLogout} title="Logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
