import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, Redirect, useParams } from 'react-router-dom';
import { useInput } from '../../hooks/useInput';
import { socketService } from '../../services/SocketService';
import { getMessagesFromDialogWith, getUserById } from '../../store/reducers/chat';
import { getUser } from '../../store/reducers/user';

import Button from '../common/Button';
import Input from '../common/Input';
import Title from '../common/Title';
import styles from './ChatPage.module.css';
import Message from './Message';

const messageValidator = (value) => value.length;

function ChatPage() {
    const { interlocutorId = '' } = useParams();
    const interlocutor = useSelector(getUserById(interlocutorId));
    const user = useSelector(getUser);
    const messages = useSelector(getMessagesFromDialogWith(interlocutorId));
    const { value: messageText, onChange, isValid, reset } = useInput('', messageValidator);

    // scrolling
    const firstUpdate = useRef(true);
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        socketService.readDialog(interlocutorId).catch((e) => console.error(e));

        if (messagesContainerRef.current) {
            if (firstUpdate.current) firstUpdate.current = false;
            messagesContainerRef.current.scrollIntoView();
        }
    }, [messages.length, interlocutorId]);

    const onSend = useCallback(
        throttle(() => {
            if (!messageText) return;
            reset();
            socketService.sendMessage(user, interlocutor, messageText).catch((error) => console.error(error));
            messagesContainerRef.current.scrollIntoView();
        }, 1000),
        [messageText]
    );

    const onKeyDown = (e) => {
        if (e.key === 'Enter') onSend();
    };

    if (!interlocutor) return <Redirect to="/dialogs" />;
    return (
        <div className={styles.ChatPage}>
            <Title
                text={interlocutor.username}
                style={{ textAlign: 'center', paddingLeft: 30, marginTop: 33, marginBottom: 25 }}
            />

            <span className={styles.ChatPageBack}>
                <Link to="/dialogs">Back</Link>
            </span>

            <div className={styles.MessagesSection}>
                <div
                    className={styles.MessagesContainer}
                    style={{ scrollBehavior: firstUpdate.current ? 'auto' : 'smooth' }}
                >
                    {messages.map((message, i) => (
                        <Message key={i} {...{ userId: user.id, message }} />
                    ))}
                    <div className={styles.MessageBottom} ref={messagesContainerRef} />
                </div>
            </div>

            <div className={styles.InputSection}>
                <div style={{ flex: 1 }}>
                    <Input placeholder="Your message" value={messageText} onChange={onChange} onKeyDown={onKeyDown} />
                </div>
                <Button
                    text="Send"
                    onClick={onSend}
                    style={{ width: 86, height: 38, marginLeft: 10 }}
                    disabled={!isValid}
                />
            </div>
        </div>
    );
}

export default ChatPage;
