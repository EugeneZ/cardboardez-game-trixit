import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import user from './user';
import users from './users';
import game from './game';
import games from './games';
import errors from './errors';

const reducer = combineReducers({
    user,
    users,
    game,
    games,
    errors
});

export default function (sagaMiddleware) {
    return createStore(reducer, compose(
        applyMiddleware(sagaMiddleware),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));
};