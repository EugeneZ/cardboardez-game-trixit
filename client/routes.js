import React from 'react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './component/App';
import GamesList from './component/GamesList';
import NewGame from './component/NewGame';
import Welcome from './component/Welcome';
import PlayArea from './component/PlayArea';

export default function (store) {

    function requireAuthentication(nextState, replace) {
        if (!store.getState().user.id) {
            replace({
                pathname: '/login',
            });
        }
    }

    return (
        <Provider store={store}>
            <MuiThemeProvider>
                <Router history={browserHistory}>
                    <Route path="/" component={App}>
                        <IndexRoute component={GamesList} onEnter={requireAuthentication}/>
                        <Route path="login" component={Welcome}/>
                        <Route path="new" component={NewGame} onEnter={requireAuthentication}/>
                        <Route path="game/:id" component={PlayArea} onEnter={requireAuthentication}/>
                    </Route>
                </Router>
            </MuiThemeProvider>
        </Provider>
    );
}