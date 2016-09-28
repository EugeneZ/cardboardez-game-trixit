import { takeLatest } from 'redux-saga';
import { put, take } from 'redux-saga/effects';
import feathers from '../feathers';
import { browserHistory } from 'react-router';

function* createGame(action) {
    try {
        const data = yield feathers.service('/api/games').create(action.data);
        browserHistory.push({ pathname: `/game/${data.id}` });
        yield put({ type: 'CREATE_GAME_SUCCESS', data });
    } catch(error) {
        console.log(error);
        yield put({ type: 'CREATE_GAME_FAILURE', error });
    }
}

export function* watchForCreateGame() {
    yield* takeLatest('CREATE_GAME', createGame);
};

export function* watchForGetOwnGames() {
    try {
        const userAction = yield take('AUTHENTICATE_SUCCESS');
        yield put({ type: 'FETCH_USERS' });
        const data = yield feathers.service('/api/games').find({ query: { hasPlayer: userAction.data.id}});
        yield put({ type: 'FETCH_GAMES_SUCCESS', data });
    } catch (error) {
        yield put({ type: 'FETCH_GAMES_FAILURE', error });
    }
};