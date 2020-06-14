import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './ChatPage.module.css';

const cx = classNames.bind(styles);

const Message = ({ userId, message }) => {
    const { from, to, text, sentAt, id } = message;

    if (userId !== from && userId !== to) return null;

    const className = cx({
        [styles.MessagePending]: userId === from && !id,
        [styles.Message]: true,
        [styles.MessageSent]: userId === from,
        [styles.MessageReceived]: userId === to,
    });

    return (
        <div className={className}>
            <div>{text}</div>
        </div>
    );
};

Message.propTypes = {
    userId: PropTypes.string.isRequired,
    message: PropTypes.shape({
        from: PropTypes.string.isRequired,
        to: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        sentAt: PropTypes.number,
        id: PropTypes.string,
    }),
};

export default Message;
