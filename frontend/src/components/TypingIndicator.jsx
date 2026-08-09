import './TypingIndicator.css';

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;

  let text = '';
  if (users.length === 1) {
    text = `${users[0]} is typing`;
  } else if (users.length === 2) {
    text = `${users[0]} and ${users[1]} are typing`;
  } else {
    text = 'Several people are typing';
  }

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="typing-text">{text}...</span>
    </div>
  );
};

export default TypingIndicator;
