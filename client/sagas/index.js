import reduxSaga from 'redux-saga';
import { authenticate } from './authentication';
import { watchForFetchUsers } from './users';
import { watchForCreateGame, watchForGetOwnGames } from './games';

const sagaMiddleware = reduxSaga();

export { sagaMiddleware };

export function runSagas() {
    [
        authenticate,
        watchForCreateGame,
        watchForFetchUsers,
        watchForGetOwnGames
    ].forEach(saga => sagaMiddleware.run(saga));
}