import { takeLatest } from 'redux-saga';
import { put, take } from 'redux-saga/effects'
import feathers from '../feathers';

function* patchProfile(action) {
    try {
        const users = yield feathers.service('/api/users').patch(feathers.get('user').id, action.data);
        yield put({ type: 'PATCH_USERS_SUCCESS', data: users });
    } catch (error) {
        yield put({ type: 'PATCH_USERS_FAILURE', error });
    }
}

export function* initializeUsers() {
    try {
        const users = yield feathers.service('/api/users').find();
        yield put({ type: 'FETCH_USERS_SUCCESS', data: users });
    } catch (error) {
        yield put({ type: 'FETCH_USERS_FAILURE', error });
    }
}

export function* watchForPatchProfile() {
    yield* takeLatest('PATCH_PROFILE', patchProfile);
}