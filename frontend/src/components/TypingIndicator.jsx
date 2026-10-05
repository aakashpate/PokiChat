const TypingIndicator = ({ typingUsers, currentUser }) => {
  const othersTyping = [...typingUsers].filter((u) => u !== currentUser);

  if (othersTyping.length === 0) return null;

  const text =
    othersTyping.length === 1
      ? `${othersTyping[0]} is typing`
      : `${othersTyping.join(', ')} are typing`;

  return (
    <div className="typing-indicator">
      <span className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
      <span className="typing-text">{text}...</span>
    </div>
  );
};

export default TypingIndicator;
