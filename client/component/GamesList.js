import React, { Component } from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

export default class GamesList extends Component {
    render() {
        const { users, onGotoGame } = this.props;
        const games = this.props.games.slice().sort((a,b)=>a.updated < b.updated);

        if (!users || !users.length || !games || !games.length) {
            return this.renderNoGames();
        }

        return (
            <Table onRowSelection={arr=>onGotoGame(games[arr[0]])}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn>Title</TableHeaderColumn>
                        <TableHeaderColumn>Players</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true} stripedRows={true}>
                    {games.map(game =>
                        <TableRow key={game.id}>
                            <TableRowColumn>{game.title}</TableRowColumn>
                            <TableRowColumn>{game.players.map((id, key) =>
                                <div key={key}>{users.filter(p=>p.id == id)[0] ? users.filter(p=>p.id == id)[0].name : 'INVALID GAME'}</div>
                            )}</TableRowColumn>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
    }

    renderNoGames() {
        return (
            <Paper style={{ maxWidth: 500, padding: 10, margin: '0 auto' }}>
                <p>Welcome to CardboardEZ. Get started by creating your first game.</p>
                <RaisedButton primary={true} label="Create a game" onClick={this.props.onGotoNewGame}/>
            </Paper>
        );
    }
};