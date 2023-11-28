import React from 'react';
import { Alert } from 'antd';

function Message({ type, message }) {
  return <Alert message={message} type={type} />;
}

Message.defaultProps = {
  type: 'error',
};

export default Message;
