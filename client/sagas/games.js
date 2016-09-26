import { takeLatest } from 'redux-saga';
import { put } from 'redux-saga/effects';
import feathers from '../feathers';

function* createGame(action) {
    try {
        const data = yield feathers.service('games').create(action.data);
        yield put({ type: 'CREATE_GAME_SUCCESS', data });
    } catch(error) {
        yield put({ type: 'CREATE_GAME_FAILURE', error });
    }
}

export function* watchForCreateGame() {
    yield* takeLatest('CREATE_GAME', createGame);
};