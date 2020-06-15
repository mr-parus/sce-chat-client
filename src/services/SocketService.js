import socketIOClient from 'socket.io-client';
import { v4 as uuidV4 } from 'uuid';
import config from '../config';

import * as actionTypes from '../constants/actionTypes';
import * as socketEventNames from '../constants/socketEventNames';

const createMessage = ({ sentAt, ...fields }) => ({ ...fields, sentAt: +new Date(sentAt) });

export class SocketService {
    constructor() {
        this._socket = null;
        this._store = null;
        this._token = sessionStorage.getItem('token');
    }

    get connected() {
        return this._socket && this._socket.connected;
    }

    init(store) {
        const socket = socketIOClient.connect(config.socketUri);
        this._socket = socket;
        this._store = store;

        socket.on('connect', () => {
            if (this._token) {
                this.joinChat(null, this._token)
                    .catch((err) => console.error(err))
                    .finally(() => {
                        store.dispatch({ type: actionTypes.SOCKET_CONNECT });
                    });
            } else {
                setTimeout(() => store.dispatch({ type: actionTypes.SOCKET_CONNECT }), 700); // sorry
            }

            socket.on('disconnect', () => store.dispatch({ type: actionTypes.SOCKET_DISCONNECT }));

            socket.on(socketEventNames.GET_MESSAGES_RESULT, (packet) => {
                const [errorMessage, from, messages] = packet;
                if (errorMessage) return console.error('GET_MESSAGES_RESULT error:', errorMessage);

                store.dispatch({ type: actionTypes.DIALOG_RESTORE, from, messages: messages.map(createMessage) });
            });

            socket.on(socketEventNames.RECEIVE_MESSAGE, (packet) => {
                store.dispatch({ type: actionTypes.MESSAGE_RECEIVE, message: createMessage(packet[0]) });
            });

            socket.on(socketEventNames.NEW_JOIN, (packet) => {
                const user = packet[0];
                this.emit(socketEventNames.GET_MESSAGES, [user.id, this._token]);
                store.dispatch({ type: actionTypes.USER_CONNECTED, user });
            });

            socket.on(socketEventNames.DISCONNECT, (packet) => {
                store.dispatch({
                    type: actionTypes.USER_DISCONNECTED,
                    user: packet[0],
                });
            });
        });
    }

    //

    emit(eventName, message) {
        if (!this.connected) throw new Error('Socket is not connected!');
        this._socket.emit(eventName, message);
    }

    dispatch(type, data = {}) {
        if (!this._store) throw new Error('Store is not initialised!');
        this._store.dispatch({ type, ...data });
    }

    //

    async joinChat(username) {
        const eventBody = username ? [username] : [null, this._token];
        this.emit(socketEventNames.JOIN, eventBody);

        return new Promise((res, rej) => {
            this._socket.once(socketEventNames.JOIN_RESULT, (packet) => {
                const [errorMessage, user, onlineUsers, token] = packet;
                if (errorMessage) {
                    sessionStorage.removeItem('token');
                    return rej(new Error(errorMessage));
                }

                sessionStorage.setItem('token', token);
                this._token = token;

                for (const user of onlineUsers) {
                    this.emit(socketEventNames.GET_MESSAGES, [user.id, this._token]);
                }

                this.dispatch(actionTypes.JOIN_SUCCESS, { user, onlineUsers });
                res();
            });
        });
    }

    async sendMessage(sender, receiver, messageText) {
        const hash = uuidV4();
        const message = { from: sender.id, to: receiver.id, text: messageText };

        const initialMessage = { ...message, hash, sentAt: Date.now() };
        this.dispatch(actionTypes.MESSAGE_SEND, { message: initialMessage });

        this.emit(socketEventNames.SEND_MESSAGE, [message, this._token, hash]);

        return new Promise((res, rej) => {
            this._socket.on(socketEventNames.SEND_MESSAGE_RESULT, (packet) => {
                const [errorMessage, receivedHash, id, sentAt] = packet;
                if (hash === receivedHash) {
                    const newMessage = { ...message, id, sentAt, hash };
                    setTimeout(() => {
                        this.dispatch(actionTypes.MESSAGE_RECEIVED_BY_SERVER, { message: createMessage(newMessage) });
                    }, 30);
                    if (errorMessage) return rej(new Error(errorMessage));
                    res();
                }
            });
        });
    }

    async readDialog(interlocutorId) {
        const state = this._store.getState();

        if (
            !state.user ||
            !state.chat.dialogs ||
            !state.chat.dialogs[interlocutorId] ||
            !state.chat.dialogs[interlocutorId].unread > 0
        )
            return;

        this.dispatch(actionTypes.DIALOG_READ, { interlocutorId });
        this.emit(socketEventNames.READ, [interlocutorId, this._token]);
    }
}

export const socketService = new SocketService();
