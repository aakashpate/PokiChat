const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID' });
  }

  if (err.name === 'MulterError' || err.name === 'UploadError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be smaller than 5MB'
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
};

module.exports = errorHandler;
