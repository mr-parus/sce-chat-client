import React, { useCallback, useState } from 'react';
import throttle from 'lodash/throttle';
import { useHistory } from 'react-router-dom';

import { useInput } from '../../hooks/useInput';
import { socketService } from '../../services/SocketService';
import Button from '../common/Button';
import Input from '../common/Input';
import Title from '../common/Title';
import styles from './Intro.module.css';

const usernameValidator = (value) => value.length;

function IntroPage() {
    const history = useHistory();
    const [connecting, setConnecting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { value: username, onChange, isValid } = useInput('', usernameValidator);

    const onJoin = useCallback(
        throttle(() => {
            setConnecting(true);
            setErrorMessage('');
            socketService
                .joinChat(username)
                .then(() => {
                    // setConnecting(false);
                    history.push('/dialogs');
                })
                .catch((err) => {
                    setErrorMessage(err.message);
                    setConnecting(false);
                });
        }, 1000),
        [username]
    );

    const onKeyDown = (e) => {
        if (errorMessage) setErrorMessage('');
        if (e.key === 'Enter') onJoin();
    };

    return (
        <div className={styles.IntroPage}>
            <Title text={'Join the Chat!'} style={{ marginBottom: 33 }} />

            <Input
                value={username}
                onChange={onChange}
                onKeyDown={onKeyDown}
                errorMessage={errorMessage}
                placeholder={'Username'}
            />

            <Button
                text={'start'}
                disabled={!isValid || connecting || errorMessage}
                onClick={onJoin}
                style={{ margin: '40px 0' }}
            />
        </div>
    );
}

export default IntroPage;
