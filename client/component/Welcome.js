import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Paper from 'material-ui/Paper';

export default ()=>
    <div style={{ padding: '5%' }}>
        <div style={{ display: 'flex', marginBottom: 50, flexWrap: 'wrap' }}>
            <RaisedButton primary={true} label="Login with Google" href="/auth/google"
                          icon={<FontIcon className="fa fa-google"/>} style={{ margin: '10px auto' }}/>
            <RaisedButton primary={true} label="Login with Facebook" href="/auth/facebook"
                          icon={<FontIcon className="fa fa-facebook"/>} style={{ margin: '10px auto' }}/>
            <RaisedButton primary={true} label="Login with Github" href="/auth/github"
                          icon={<FontIcon className="fa fa-github"/>} style={{ margin: '10px auto' }}/>
        </div>
    </div>;