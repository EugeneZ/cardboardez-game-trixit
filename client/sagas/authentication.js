import { browserHistory } from 'react-router'
import { call, put, take } from 'redux-saga/effects'
import feathers from '../feathers';

export function* watchForLogout() {
    try {
        while (true) {
            yield take('LOGOUT');
            yield feathers.logout();
            yield put({ type: 'LOGOUT_SUCCESS' });
            browserHistory.push('/login');
        }
    } catch (error) {
        yield put({ type: 'LOGOUT_FAILURE', error });
    }
};