import { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please enter a username');
      return;
    }

    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (trimmed.length > 30) {
      setError('Username cannot exceed 30 characters');
      return;
    }

    setError('');
    localStorage.setItem('pulsechat_username', trimmed);
    onLogin(trimmed);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="#6366f1" />
              <path
                d="M14 20C14 17.7909 15.7909 16 18 16H30C32.2091 16 34 17.7909 34 20V26C34 28.2091 32.2091 30 30 30H26L21 34V30H18C15.7909 30 14 28.2091 14 26V20Z"
                fill="white"
              />
              <circle cx="20" cy="23" r="1.5" fill="#6366f1" />
              <circle cx="24" cy="23" r="1.5" fill="#6366f1" />
              <circle cx="28" cy="23" r="1.5" fill="#6366f1" />
            </svg>
          </div>
          <h1 className="logo-text">PokiChat</h1>
          <p className="logo-subtitle">Real-time messaging</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Choose a username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Enter your username"
              maxLength={30}
              autoFocus
            />
            {error && <span className="input-error">{error}</span>}
          </div>
          <button type="submit" className="btn-primary">
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
