import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import feathers from '../feathers';
import { browserHistory } from 'react-router';

function* createGame(action) {
    try {
        const data = yield feathers.service('/api/games').create(action.data);
        browserHistory.push({ pathname: `/game/${data.id}` });
        yield put({ type: 'CREATE_GAME_SUCCESS', data });
    } catch (error) {
        yield put({ type: 'CREATE_GAME_FAILURE', error });
    }
}

function* gameAction(action){
    try {
        const data = yield feathers.service('/api/games').update(action.data.id, action.data);
        yield put({ type: 'GAME_ACTION_SUCCESS', data });
    } catch (error) {
        yield put({ type: 'GAME_ACTION_FAILURE', error });
    }
}

export function* watchForCreateGame() {
    yield* takeLatest('CREATE_GAME', createGame);
}

export function* watchForGameAction() {
    yield* takeLatest('GAME_ACTION', gameAction);
}

export function* initializeGames() {
    try {
        const data = yield feathers.service('/api/games').find({ query: { hasPlayer: feathers.get('user').id } });
        yield put({ type: 'FETCH_GAMES_SUCCESS', data });
    } catch (error) {
        yield put({ type: 'FETCH_GAMES_FAILURE', error });
    }
}