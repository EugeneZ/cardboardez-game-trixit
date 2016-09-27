import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './component/App';

export default function(store){
    return (
        <Provider store={store}>
            <MuiThemeProvider>
                <Router history={browserHistory}>
                    <Route path="/" component={App}>
                        <Route path="about" component={About}/>
                        <Route path="users" component={Users}>
                            <Route path="/user/:userId" component={User}/>
                        </Route>
                        <Route path="*" component={NoMatch}/>
                    </Route>
                </Router>
            </MuiThemeProvider>
        </Provider>
    );
}