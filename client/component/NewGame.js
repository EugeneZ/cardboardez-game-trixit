import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import autobind from 'autobind-decorator';

const gameInfo = {
    trixit: {
        minPlayers: 3,
        maxPlayers: 8
    }
};

@autobind
export default class NewGame extends Component {
    state = {
        game: null,
        title: this.props.user.name + '\'s Game',
        players: [this.props.user.id],
        dirtyTitle: false
    };

    render() {
        const { game, title, players, dirtyTitle } = this.state;
        return (
            <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                <SelectField value={game} floatingLabelText="Select Game" onChange={this.onChangeGame} fullWidth={true}>
                    <MenuItem value="trixit" primaryText="Trixit"/>
                </SelectField>
                <TextField floatingLabelText="Game Title" value={title} onChange={this.onChangeTitle} fullWidth={true}
                           errorText={dirtyTitle && !title.length && 'You must set a title'}/>
                {game && this.renderPlayers()}
                {game && title && players.length >= gameInfo[game].minPlayers &&
                <RaisedButton label="Create Game" onTouchTap={this.onClickCreateGame} style={{ float: 'right' }}
                              primary={true}/> }
                <div style={{ clear: 'both' }}>&nbsp;</div>
            </Paper>
        );
    }

    renderPlayers() {
        const { players, game } = this.state;
        const { maxPlayers, minPlayers } = gameInfo[game];

        let retval = [];

        for (let i = 0; i < maxPlayers; i++) {
            if (players[i - 1] || i < minPlayers) {
                retval.push(
                    <SelectField key={i} value={players[i]} floatingLabelText={`Player ${i + 1}`}
                                 onChange={this.onChangePlayer.bind(this, i)} fullWidth={true}
                                 errorText={!players[i] && i < minPlayers && 'This player is required'}>
                        {this.props.users.map(player => <MenuItem key={player.id} value={player.id}
                                                                  primaryText={player.name}/>)}
                    </SelectField>
                );
            }
        }

        return retval;
    }

    onChangeGame(ev, i, value) {
        this.setState({ game: value });
    }

    onChangeTitle(ev) {
        this.setState({
            title: ev.target.value,
            dirtyTitle: true
        });
    }

    onChangePlayer(i, ev, key, value) {
        const newPlayers = this.state.players.slice();
        newPlayers[i] = value;
        this.setState({ players: newPlayers.filter(p => p) });
    }

    onClickCreateGame() {
        const { game, title } = this.state;
        const players = this.state.players.filter(p=>p);

        this.setState({ dirtyTitle: true });

        if (!title) {
            return;
        } else if (players.length < gameInfo[game].minPlayers) {
            return;
        }

        this.props.onNewGame({
            game,
            title,
            players
        });
    }
};