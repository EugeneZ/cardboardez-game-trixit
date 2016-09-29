import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import feathers from '../feathers';

function getMyName(props) {
    const me = props.user;
    return me && me.name;
}

@autobind
export default class Profile extends Component {
    state = {
        name: getMyName(this.props)
    };

    componentWillReceiveProps(nextProps) {
        if (!this.state.name) {
            this.setState({
                name: getMyName(nextProps)
            });
        }
    }

    render() {
        if (!this.state.name) {
            return null;
        }

        return (
            <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                <TextField floatingLabelText="Your Name" value={this.state.name} onChange={this.onChangeName}
                           fullWidth={true}/>
                <RaisedButton label="Update Profile" onTouchTap={this.onClickSubmit} style={{ float: 'right' }}
                              primary={true}/>
                <div style={{ clear: 'both' }}>&nbsp;</div>
            </Paper>
        )
    }

    onChangeName(e) {
        this.setState({ name: e.target.value });
    }

    onClickSubmit() {
        const { name } = this.state;
        if (!name || name.length < 2) {
            this.setState({ nameError: 'Your name must be at least two characters' });
            return;
        }

        this.props.onPatchProfile({ name });
    }
}