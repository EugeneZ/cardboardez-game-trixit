import polyfill from 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './component/App';
import { subscribeAll } from './realtime';
import { sagaMiddleware, runSagas } from './sagas';
import createStore from './reducers';

// needed for material-ui
injectTapEventPlugin();

// redux store
const store = createStore(sagaMiddleware);

// Sagas
runSagas();

// realtime
subscribeAll(store.dispatch);

// GO!
ReactDOM.render(
    <Provider store={store}>
        <MuiThemeProvider>
            <App/>
        </MuiThemeProvider>
    </Provider>

    , document.getElementById('react')
);
