import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';

export default ()=>
    <Paper style={{ padding: '5%' }}>
        <div style={{ display: 'flex', marginBottom: 50 }}>
            <RaisedButton primary={true} label="Login with Google" href="/auth/google"
                          icon={<FontIcon className="fa fa-google"/>} style={{ margin: 'auto' }}/>
            <RaisedButton primary={true} label="Login with Facebook" href="/auth/facebook"
                          icon={<FontIcon className="fa fa-facebook"/>} style={{ margin: 'auto' }}/>
            <RaisedButton primary={true} label="Login with Github" href="/auth/github"
                          icon={<FontIcon className="fa fa-github"/>} style={{ margin: 'auto' }}/>
        </div>
    </Paper>;