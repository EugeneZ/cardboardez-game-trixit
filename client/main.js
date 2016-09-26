import polyfill from 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import reduxSaga from 'redux-saga';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import user from './reducers/user';
import users from './reducers/users';
import game from './reducers/game';
import games from './reducers/games';
import App from './component/App';
import { authenticate } from './sagas/authentication';
import { watchForFetchUsers } from './sagas/users';
import { watchForCreateGame } from './sagas/games';

injectTapEventPlugin();

const sagaMiddleware = reduxSaga();

const store = createStore(combineReducers({ user, users, game, games }), compose(
    applyMiddleware(reduxThunk, sagaMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
));

sagaMiddleware.run(authenticate);
sagaMiddleware.run(watchForFetchUsers);
sagaMiddleware.run(watchForCreateGame);

ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider>
            <App/>
        </MuiThemeProvider>
    </Provider>

    , document.getElementById('react')
);
