import React, { Component } from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import { withRouter } from 'react-router';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';
import feathers from '../feathers';

@connect(state => Object.assign({}, state, {
    user: state.users.length && feathers.get('user') ? state.users.filter(user => user.id === feathers.get('user').id)[0] : feathers.get('user') || {}
}))
@autobind
export default withRouter(class App extends Component {
    render() {
        const childProps = Object.assign({}, this.props, {
            onNewGame: this.onClickCreateGame,
            onGotoGame: this.onClickGame,
            onSendAction: this.onSendAction,
            onPatchProfile: this.onPatchProfile,
            onGotoNewGame: this.onClickNewGame
        });

        return (
            <div>
                <AppBar title={'CardboardEZ' + (this.props.user.name ? ` - ${this.props.user.name}` : '')}
                        showMenuIconButton={false} iconElementRight={this.renderRightAppBarIcon()}/>
                {React.cloneElement(this.props.children, childProps)}
            </div>
        )
    }

    renderRightAppBarIcon() {
        if (!this.props.user.id) {
            return null;
        }

        return (
            <IconMenu iconButtonElement={<IconButton><MenuIcon/></IconButton>}
                      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
                <MenuItem key={0} primaryText="Start New Game" onTouchTap={this.onClickNewGame}/>
                <MenuItem key={1} primaryText="My Games" onTouchTap={this.onClickMyGames}/>
                <MenuItem key={2} primaryText="Profile" onTouchTap={this.onClickProfile}/>
                <MenuItem key={3} primaryText="Log Out" onTouchTap={this.onClickLogout}/>
            </IconMenu>
        );
    }

    onClickLogout() {
        this.props.dispatch({ type: 'LOGOUT' });
    }

    onClickNewGame() {
        this.props.router.push({ pathname: '/new' });
    }

    onClickMyGames() {
        this.props.router.push({ pathname: '/' });
    }

    onClickProfile() {
        this.props.router.push({ pathname: '/profile' });
    }

    onClickCreateGame(data) {
        this.props.dispatch({ type: 'CREATE_GAME', data });

    }

    onClickGame(game) {
        this.props.router.push({ pathname: `/game/${game.id}` });
        this.props.dispatch({ type: 'ACTIVATE_GAME', data: game });
    }

    onSendAction(data) {
        this.props.dispatch({ type: 'GAME_ACTION', data: Object.assign({ id: this.props.params.id }, data ) });
    }

    onPatchProfile(data) {
        this.props.dispatch({ type: 'PATCH_PROFILE', data });
    }
});