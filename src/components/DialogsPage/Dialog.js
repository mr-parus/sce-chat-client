import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import Divider from '../common/Divider';
import styles from './Dialog.module.css';

const Dialog = ({ from, unread = 0 }) => {
    return (
        <div className={styles.Dialog}>
            <span className={styles.Dialog_interlocutor}>
                <Link to={`/chat/${from.id}`}>{from.username}</Link>
            </span>

            {!unread ? null : (
                <div className={styles.Dialog_unread}>
                    <span className={styles.Dialog_unread_label}>unread</span>
                    <span className={styles.Dialog_unread_badge}>{unread > 99 ? 99 : unread}</span>
                </div>
            )}
            <Divider />
        </div>
    );
};

Dialog.propTypes = {
    from: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    }),
    unread: PropTypes.number,
};

export default Dialog;
