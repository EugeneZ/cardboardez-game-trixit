import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import user from './user';
import users from './users';
import game from './game';
import games from './games';

const reducer = combineReducers({
    user,
    users,
    game,
    games
});

export default function(sagaMiddleware){
    return createStore(reducer, compose(
        applyMiddleware(sagaMiddleware),
        window.devToolsExtension ? window.devToolsExtension() : f => f
    ));
};