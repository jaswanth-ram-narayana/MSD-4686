import React from 'react';

const Toast = ({ message, type = 'info' }) => {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`} role="status">
      {message}
    </div>
  );
};

export default Toast;
