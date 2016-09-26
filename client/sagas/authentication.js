import { takeEvery, takeLatest } from 'redux-saga'
import { call, put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* authenticate() {
    try {
        while (true) {
            yield feathers.authenticate();
            yield put({ type: 'AUTHENTICATE_SUCCESS', data: feathers.get('user') });
            yield take('LOGOUT');
            yield feathers.logout();
            yield put({ type: 'LOGOUT_SUCCESS' });
        }
    } catch (error) {
        yield put({ type: 'AUTHENTICATE_FAILURE', error });
    }
};