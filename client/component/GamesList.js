import React, { Component } from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class GamesList extends Component {
    render() {
        if (!this.props.users || !this.props.users.length || !this.props.games || !this.props.games.length) {
            return null;
        }
        return (
            <Table onRowSelection={arr=>this.props.onClickGame(this.props.games[arr[0]])}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn>Title</TableHeaderColumn>
                        <TableHeaderColumn>Players</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true} stripedRows={true}>
                    {this.props.games.map(game =>
                        <TableRow key={game.id}>
                            <TableRowColumn>{game.title}</TableRowColumn>
                            <TableRowColumn>{game.players.map((id, key) =>
                                <div key={key}>{this.props.users.filter(p=>p.id==id)[0].name}</div>
                            )}</TableRowColumn>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        );
    }
};