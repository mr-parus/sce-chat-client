import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { getDialogs } from '../../store/reducers/chat';
import { getUser } from '../../store/reducers/user';
import Title from '../common/Title';
import Dialog from './Dialog';
import styles from './Dialog.module.css';

function DialogsPage() {
    const dialogs = useSelector(getDialogs);
    const user = useSelector(getUser);

    const alongMessage = useMemo(() => {
        return (
            <p>
                <b>{user.username}</b>, looks like you are alone here{' '}
                <span aria-label="alone" role="img">
                    😬
                </span>
            </p>
        );
    }, [user]);

    return (
        <div className={styles.DialogsPage}>
            <Title text={'Currently online'} style={{ marginTop: 33, marginBottom: 25 }} />

            {dialogs.length ? null : alongMessage}
            <div className={styles.DialogsSection}>
                <div className={styles.DialogsContainer}>
                    <TransitionGroup>
                        {dialogs.map((dialog) => (
                            <CSSTransition timeout={400} classNames="dialog" key={dialog.from.id}>
                                <Dialog {...dialog} />
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </div>
            </div>
        </div>
    );
}

export default DialogsPage;
