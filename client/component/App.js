import React, { Component } from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import FlatButton from 'material-ui/FlatButton';
import Welcome from './Welcome';
import NewGame from './NewGame';

@connect(state => state)
@autobind
export default class App extends Component {
    state = {
        page: 'welcome'
    };

    render() {
        const { page } = this.state;
        const { user, users } = this.props;
        return (
            <div>
                <AppBar title={'CardboardEZ' + (user.name ? ` - ${user.name}` : '')}
                        showMenuIconButton={false} iconElementRight={this.renderRightAppBarIcon()}/>
                {page === 'welcome' && <Welcome/>}
                {page === 'newgame' && <NewGame users={users} user={user} onNewGame={this.onClickCreateGame}/>}
            </div>
        )
    }

    renderRightAppBarIcon() {
        switch (this.state.page) {
            case 'welcome':
                return (
                    <IconMenu
                        iconButtonElement={<IconButton><MenuIcon /></IconButton>}
                        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    >
                        {this.props.user.id ? this.renderAuthenticatedMenu() : this.renderUnauthenticatedMenu()}
                    </IconMenu>
                );
            case 'newgame':
                return null;
        }
    }

    renderAuthenticatedMenu() {
        return [
            <MenuItem key={0} primaryText="Start New Game" onTouchTap={this.onClickNewGame}/>,
            <MenuItem key={1} primaryText="My Games" onTouchTap={this.onClickMyGames}/>,
            <MenuItem key={2} primaryText="Log Out" onTouchTap={this.onClickLogout}/>
        ];
    }

    renderUnauthenticatedMenu() {
        return [
            <MenuItem key={0} primaryText="Login to Facebook" onTouchTap={this.onClickLogin.bind(this, 'facebook')}/>,
            <MenuItem key={1} primaryText="Login to GitHub" onTouchTap={this.onClickLogin.bind(this, 'github')}/>,
            <MenuItem key={2} primaryText="Login to Google" onTouchTap={this.onClickLogin.bind(this, 'google')}/>
        ];
    }

    onClickLogout() {
        this.props.dispatch({ type: 'LOGOUT' });
    }

    onClickLogin(suffix) {
        window.location = '/auth/' + suffix;
    }

    onClickNewGame() {
        this.props.dispatch({ type: 'FETCH_USERS' });
        this.setState({ page: 'newgame' });
    }

    onClickMyGames() {
        this.setState({ page: 'games' });
    }

    onClickCreateGame(data) {
        this.setState({ page: data.game });
        this.props.dispatch({ type: 'CREATE_GAME', data });

    }
}