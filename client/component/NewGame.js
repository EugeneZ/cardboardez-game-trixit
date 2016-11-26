import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import Toggle from 'material-ui/Toggle';
import autobind from 'autobind-decorator';
import { getLibrary, getConfiguration } from '../../game/clientGameProvider';

@autobind
export default class NewGame extends Component {
    state = {
        game: null,
        title: this.props.user.name + '\'s Game',
        players: [this.props.user.id],
        dirtyTitle: false,
        options: {}
    };

    render() {
        const { game, title, players, dirtyTitle, options } = this.state;

        const config = game && getConfiguration(game, options, players.filter(p=>p).length);

        return (
            <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                <SelectField value={game} floatingLabelText="Select Game" onChange={this.onChangeGame} fullWidth={true}>
                    {getLibrary().map(name => <MenuItem key={name} value={name} primaryText={getConfiguration(name).name}/>)}
                </SelectField>
                <TextField floatingLabelText="Game Title" value={title} onChange={this.onChangeTitle} fullWidth={true}
                           errorText={dirtyTitle && !title.length && 'You must set a title'}/>
                {game && this.renderPlayers(config)}
                {game && this.renderOptions(config)}
                {game && title && players.length >= config.minPlayers &&
                <RaisedButton label="Create Game" onTouchTap={()=>this.onClickCreateGame(config)} style={{ float: 'right' }}
                              primary={true}/> }
                <div style={{ clear: 'both' }}>&nbsp;</div>
            </Paper>
        );
    }

    renderPlayers(config) {
        const { players } = this.state;
        const { maxPlayers, minPlayers } = config;

        let retval = [];

        for (let i = 0; i < maxPlayers; i++) {
            if (players[i - 1] || i < minPlayers) {
                retval.push(
                    <SelectField key={i} value={players[i]} floatingLabelText={`Player ${i + 1}`}
                                 onChange={this.onChangePlayer.bind(this, i)} fullWidth={true}
                                 errorText={!players[i] && i < minPlayers && 'This player is required'}>

                        {this.props.users
                            .filter(user => user.id === players[i] || players.indexOf(user.id) === -1)
                            .map(player => <MenuItem key={player.id} value={player.id} primaryText={player.name}/>)}

                    </SelectField>
                );
            }
        }

        return retval;
    }

    renderOptions(config) {
        const stateOptions = this.state.options;
        const { options } = config;

        if (!options) {
            return null;
        }

        return options.map(option => {
            const { type, name, label, disabled, items } = option;
            const value = stateOptions[name];
            if (type === 'boolean') {
                return <Toggle
                    key={name}
                    toggled={value}
                    onToggle={(e, checked) => this.onChangeOption(name, checked)}
                    disabled={disabled}
                    label={label}
                />;
            } else if (type === 'select') {
                return <SelectField
                        key={name}
                        value={value}
                        floatingLabelText={label}
                        onChange={(e, k, v) => this.onChangeOption(name, v)}
                    >
                    {items.map(({value, label}) => <MenuItem key={value} value={value} primaryText={label}/>)}
                </SelectField>
            } else {
                return <TextField
                    key={name}
                    value={value}
                    onChange={e => this.onChangeOption(name, e.target.value)}
                    disabled={disabled}
                    floatingLabelText={label}
                />;
            }
        });
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

    onChangeOption(option, value) {
        this.setState({ options: {
            ...this.state.options,
            [option]: value
        } });
    }

    onClickCreateGame(config) {
        const { game, title, options } = this.state;
        const players = this.state.players.filter(p=>p);

        this.setState({ dirtyTitle: true });

        if (!title) {
            return;
        } else if (players.length < config.minPlayers) {
            return;
        }

        this.props.onNewGame({
            game,
            title,
            players,
            options
        });
    }
};