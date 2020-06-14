import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { getIsConnected } from '../store/reducers/sokcet';
import ChatPage from './ChatPage';
import Loader from './common/Loader';
import DialogsPage from './DialogsPage';
import IntroPage from './IntroPage';

function ProtectedRoute({ children, when, redirectTo, ...rest }) {
    return <Route {...rest} render={() => (when ? <Redirect to={redirectTo} /> : children)} />;
}
ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    when: PropTypes.bool.isRequired,
    redirectTo: PropTypes.string.isRequired,
};

function App() {
    const isSocketConnected = useSelector(getIsConnected);
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

    return (
        <div className="App">
            <Router>
                {!isSocketConnected ? (
                    <Loader />
                ) : (
                    <Switch>
                        <ProtectedRoute exact path="/" when={isLoggedIn} redirectTo="/dialogs">
                            <IntroPage />
                        </ProtectedRoute>

                        <ProtectedRoute exact path="/chat/:interlocutorId" when={!isLoggedIn} redirectTo="/">
                            <ChatPage />
                        </ProtectedRoute>

                        <ProtectedRoute exact path="/dialogs" when={!isLoggedIn} redirectTo="/">
                            <DialogsPage />
                        </ProtectedRoute>

                        <Redirect to="/" />
                    </Switch>
                )}
            </Router>
        </div>
    );
}

export default App;
