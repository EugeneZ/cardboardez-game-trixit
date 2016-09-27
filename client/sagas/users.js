import { put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* watchForFetchUsers() {
    while (true) {
        yield take('FETCH_USERS');
        const users = yield feathers.service('/api/users').find();
        yield put({ type: 'FETCH_USERS_SUCCESS', data: users });
    }
};