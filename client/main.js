import polyfill from 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { subscribeAll } from './realtime';
import { sagaMiddleware, runSagas } from './sagas';
import createStore from './reducers';
import routes from './routes';
import feathers from './feathers';

// needed for material-ui
injectTapEventPlugin();

function runApp(){
    // redux store
    const store = createStore(sagaMiddleware);

    // Sagas
    runSagas();

    // realtime
    subscribeAll(store.dispatch);

    // GO!
    ReactDOM.render(routes(store), document.getElementById('react'));
}

// Try to authenticate then render
feathers.authenticate().then(runApp, runApp).catch(runApp);