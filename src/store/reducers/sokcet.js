import { SOCKET_DISCONNECT, SOCKET_CONNECT } from '../../constants/actionTypes';

const initialState = {
    connected: false,
};

export const socketReducerName = 'socket';

export const socketReducer = (state = initialState, action) => {
    switch (action.type) {
        case SOCKET_CONNECT: {
            return {
                connected: true,
            };
        }

        case SOCKET_DISCONNECT: {
            return {
                connected: false,
            };
        }

        default:
            return state;
    }
};

// selectors

export const getIsConnected = (state) => state[socketReducerName].connected;
