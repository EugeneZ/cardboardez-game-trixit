import reduxSaga from 'redux-saga';
import { watchForLogout } from './authentication';
import { initializeUsers } from './users';
import { initializeGames, watchForCreateGame, watchForGameAction } from './games';

const sagaMiddleware = reduxSaga();

export { sagaMiddleware };

export function runSagas() {
    [
        initializeUsers,
        initializeGames,
        watchForLogout,
        watchForCreateGame,
        watchForGameAction
    ].forEach(saga => sagaMiddleware.run(saga));
}