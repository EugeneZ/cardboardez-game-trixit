import React, { Component } from 'react';
import { connect } from 'react-redux'
import autobind from 'autobind-decorator'
import { withRouter } from 'react-router';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MenuIcon from 'material-ui/svg-icons/navigation/menu';

@connect(state => state)
@autobind
export default withRouter(class App extends Component {
    render() {
        const { user } = this.props;
        const childProps = Object.assign({}, this.props, {
            onNewGame: this.onClickCreateGame,
            onGotoGame: this.onClickGame,
            onSendAction: this.onSendAction
        });

        return (
            <div>
                <AppBar title={'CardboardEZ' + (user.name ? ` - ${user.name}` : '')}
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
                <MenuItem key={2} primaryText="Log Out" onTouchTap={this.onClickLogout}/>
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

    onClickCreateGame(data) {
        this.props.dispatch({ type: 'CREATE_GAME', data });

    }

    onClickGame(game) {
        this.props.router.push({ pathname: `/game/${game.id}` });
        this.props.dispatch({ type: 'ACTIVATE_GAME', data: game });
    }

    onSendAction(data) {
        this.props.dispatch({ type: 'GAME_ACTION', data });
    }
});