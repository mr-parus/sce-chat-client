import * as actionTypes from '../../constants/actionTypes';

const initialState = {
    user: null,
    isLoggedIn: false,
};

export const userReducerName = 'user';

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.JOIN_SUCCESS:
            const { user } = action;
            return {
                ...state,
                isLoggedIn: true,
                user,
            };

        case actionTypes.CHAT_QUIT:
            return {
                ...state,
                isLoggedIn: false,
                user: null,
            };

        default:
            return state;
    }
};

// selectors

export const getUser = (state) => {
    const { user } = state[userReducerName];
    return user;
};
