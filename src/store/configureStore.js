import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import thunk from 'redux-thunk';
import { getRootReducer } from './reducers';

export const history = createBrowserHistory();

function configureStoreProd(initialState) {
    const reactRouterMiddleware = routerMiddleware(history);
    const middlewares = [thunk, reactRouterMiddleware];

    return createStore(getRootReducer(history), initialState, compose(applyMiddleware(...middlewares)));
}

function configureStoreDev(initialState) {
    const reactRouterMiddleware = routerMiddleware(history);
    const middlewares = [reduxImmutableStateInvariant(), thunk, reactRouterMiddleware];

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // add support for Redux dev tools
    const store = createStore(getRootReducer(history), initialState, composeEnhancers(applyMiddleware(...middlewares)));

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers', () => {
            const { getRootReducer } = require('./reducers');
            store.replaceReducer(getRootReducer(history));
        });
    }

    return store;
}

const configureStore = process.env.NODE_ENV === 'production' ? configureStoreProd : configureStoreDev;

export default configureStore;
