import reduxSaga from 'redux-saga';
import { watchForLogout } from './authentication';
import { initializeUsers, watchForPatchProfile } from './users';
import { initializeGames, watchForCreateGame, watchForGameAction } from './games';

const sagaMiddleware = reduxSaga();

export { sagaMiddleware };

export function runSagas() {
    [
        initializeUsers,
        initializeGames,
        watchForLogout,
        watchForCreateGame,
        watchForGameAction,
        watchForPatchProfile
    ].forEach(saga => sagaMiddleware.run(saga));
}