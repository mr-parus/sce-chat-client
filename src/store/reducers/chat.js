import omit from 'lodash/omit';
import { v4 as uuidV4 } from 'uuid';
import * as actionTypes from '../../constants/actionTypes';

const initialState = {
    dialogs: {},
    users: {},
    onlineUserIds: [],
    messages: {},
};

export const chatReducerName = 'chat';

export const chatReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.JOIN_SUCCESS: {
            const { user, onlineUsers } = action;

            const users = { [user.id]: user };
            const onlineUserIds = [];
            const dialogs = {};

            for (const user of onlineUsers) {
                onlineUserIds.push(user.id);
                users[user.id] = user;
                dialogs[user.id] = { unread: 0, from: user, messageIds: [] };
            }

            return { ...state, users, onlineUserIds, dialogs };
        }

        case actionTypes.USER_CONNECTED: {
            const { user } = action;

            return {
                ...state,
                dialogs: {
                    ...state.dialogs,
                    [user.id]: { unread: 0, from: user, messageIds: [] },
                },
                users: {
                    ...state.users,
                    [user.id]: user,
                },
                onlineUserIds: [...state.onlineUserIds, user.id],
            };
        }

        case actionTypes.USER_DISCONNECTED: {
            const { user } = action;

            return {
                ...state,
                users: omit(state.users, user.id),
                onlineUserIds: state.onlineUserIds.filter((id) => id !== user.id),
            };
        }

        case actionTypes.MESSAGE_SEND: {
            const {
                message: { to, from, text, sentAt, hash },
            } = action;

            let dialogs = state.dialogs || {};
            let currentDialog = dialogs[to] || { unread: 0, from: to, messageIds: [] };
            let messageIdsFromDialog = currentDialog.messageIds || [];
            let newMessage = { from, to, text, sentAt };

            return {
                ...state,
                dialogs: {
                    ...dialogs,
                    [to]: {
                        ...currentDialog,
                        messageIds: [...messageIdsFromDialog, hash],
                    },
                },
                messages: {
                    ...state.messages,
                    [hash]: newMessage,
                },
            };
        }

        case actionTypes.MESSAGE_RECEIVE: {
            const {
                message: { to, from, text, sentAt },
            } = action;
            const hash = uuidV4();

            let dialogs = state.dialogs || {};
            let currentDialog = dialogs[from] || { unread: 0, from, messages: [], messageIds: [] };
            let messageIdsFromDialog = currentDialog.messageIds || [];
            let newMessage = { from, to, text, sentAt };

            return {
                ...state,
                dialogs: {
                    ...dialogs,
                    [from]: {
                        ...currentDialog,
                        unread: currentDialog.unread + 1,
                        messageIds: [...messageIdsFromDialog, hash],
                    },
                },
                messages: {
                    ...state.messages,
                    [hash]: newMessage,
                },
            };
        }

        case actionTypes.DIALOG_RESTORE: {
            const { messages, from } = action;

            const newMessages = {};
            const newMessagesIds = [];

            for (const message of messages) {
                const hash = uuidV4();
                newMessagesIds.push(hash);
                newMessages[hash] = message;
            }

            let dialogs = state.dialogs || {};
            let currentDialog = dialogs[from] || { unread: 0, from, messages: [] };
            let messageIdsFromDialog = currentDialog.messageIds || [];

            return {
                ...state,
                dialogs: {
                    ...dialogs,
                    [from]: {
                        ...currentDialog,
                        messageIds: [...messageIdsFromDialog, ...newMessagesIds],
                    },
                },
                messages: {
                    ...state.messages,
                    ...newMessages,
                },
            };
        }

        case actionTypes.DIALOG_READ: {
            const { interlocutorId } = action;
            let dialogs = state.dialogs || {};
            let currentDialog = dialogs[interlocutorId] || {
                unread: 0,
                from: interlocutorId,
                messages: [],
                messageIds: [],
            };

            return {
                ...state,
                dialogs: {
                    ...dialogs,
                    [interlocutorId]: {
                        ...currentDialog,
                        unread: 0,
                    },
                },
            };
        }

        case actionTypes.MESSAGE_RECEIVED_BY_SERVER: {
            const {
                message: { id, sentAt, hash },
            } = action;

            return {
                ...state,
                messages: {
                    ...state.messages,
                    [hash]: {
                        ...state.messages[hash],
                        sentAt,
                        id,
                    },
                },
            };
        }

        default:
            return state;
    }
};

// selectors

export const getUserById = (id) => (state) => {
    const { users } = state[chatReducerName];
    return users[id];
};

export const getDialogs = (state) => {
    const { onlineUserIds } = state[chatReducerName];

    const dialogs = [];
    for (const [fromId, dialog] of Object.entries(state[chatReducerName].dialogs)) {
        if (onlineUserIds.includes(fromId)) dialogs.push(dialog);
    }

    return dialogs.sort(({ from: { username: a } }, { from: { username: b } }) => (a > b ? 1 : -1));
};

export const getMessagesFromDialogWith = (userId) => (state) => {
    const dialog = state[chatReducerName].dialogs[userId];
    if (!dialog) return [];

    const messageIds = dialog.messageIds || [];
    return messageIds.map((id) => state[chatReducerName].messages[id]).sort(({ sentAt: a }, { sentAt: b }) => a - b);
};
