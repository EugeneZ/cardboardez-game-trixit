import { browserHistory } from 'react-router'
import { call, put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* authenticate() {
    try {
        while (true) {
            yield feathers.authenticate();
            yield put({ type: 'AUTHENTICATE_SUCCESS', data: feathers.get('user') });
            browserHistory.push('/');
            yield take('LOGOUT');
            yield feathers.logout();
            yield put({ type: 'LOGOUT_SUCCESS' });
            browserHistory.push('/');
        }
    } catch (error) {
        yield put({ type: 'AUTHENTICATE_FAILURE', error });
    }
};