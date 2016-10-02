import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import _ from 'lodash';

function getWinnersArray(game, users) {
    const winners = game.winner || game.winners;
    if (!winners) {
        return [];
    }

    return _.castArray(winners).map(winner => {
        if (winner && winner.name) {
            return name;
        } else if (game.players.includes(winner)) {
            const player = users.find(player => player.id === winners);
            return player || 'Deleted User';
        } else {
            return winner;
        }
    });
}

@autobind
export default class GamesList extends Component {
    state = {
        showCompleted: false
    };

    render() {
        const { users, onGotoGame } = this.props;
        const games = this.props.games
            .slice()
            .filter(game => this.state.showCompleted ^ game.mode === 'gameover')
            .sort((a, b)=>a.updated < b.updated);

        if (!users || !users.length || !games || !games.length) {
            return this.renderNoGames();
        }

        return (
            <div>
                <Toggle label="Show Completed" style={{ margin: 16, width: 200 }} onToggle={this.onToggleCompleted}/>
                <Table onRowSelection={arr=>onGotoGame(games[arr[0]])}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Game</TableHeaderColumn>
                            <TableHeaderColumn>Title</TableHeaderColumn>
                            <TableHeaderColumn>Players</TableHeaderColumn>
                            {this.state.showCompleted && <TableHeaderColumn>Winner(s)</TableHeaderColumn>}
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false} showRowHover={true} stripedRows={true}>
                        {games.map(game =>
                            <TableRow key={game.id}>
                                <TableRowColumn>{_.startCase(game.game)}</TableRowColumn>
                                <TableRowColumn>{game.title}</TableRowColumn>
                                <TableRowColumn>{game.players.map((id, key) => {
                                    const user = users.filter(p=>p.id == id)[0];
                                    return (
                                        <div key={key}>{user ? user.name : 'Deleted User'}</div>
                                    );
                                })}</TableRowColumn>
                                { this.state.showCompleted && <TableRowColumn>{getWinnersArray(game).map(w => <div
                                    key={w}>{w}</div>)}</TableRowColumn>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    }

    renderNoGames() {
        if (!this.props.games || !this.props.games.length) {
            return (
                <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                    <p>Welcome to CardboardEZ. Get started by creating your first game.</p>
                    <RaisedButton primary={true} label="Create a game" onClick={this.props.onGotoNewGame}/>
                </Paper>
            );
        } else {
            return (
                <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                    <p>You don't have any active games. You can create one or view completed games.</p>
                    <Toggle label="Show Completed" style={{ margin: 16, width: 200 }} onToggle={this.onToggleCompleted} toggled={this.state.showCompleted}/>
                    <RaisedButton primary={true} label="Create a game" onClick={this.props.onGotoNewGame}/>
                </Paper>
            );
        }
    }

    onToggleCompleted() {
        this.setState({ showCompleted: !this.state.showCompleted });
    }
};