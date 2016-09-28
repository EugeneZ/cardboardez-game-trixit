import { put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* initializeUsers() {
    try {
        const users = yield feathers.service('/api/users').find();
        yield put({ type: 'FETCH_USERS_SUCCESS', data: users });
    } catch (error) {
        yield put({ type: 'FETCH_USERS_FAILURE', error });
    }
};