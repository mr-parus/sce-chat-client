import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import { chatReducer, chatReducerName } from './chat';
import { socketReducer, socketReducerName } from './sokcet';
import { userReducer, userReducerName } from './user';

export const getRootReducer = (history) =>
    combineReducers({
        [chatReducerName]: chatReducer,
        [userReducerName]: userReducer,
        router: connectRouter(history),
        [socketReducerName]: socketReducer,
    });
