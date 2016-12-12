import React, { Component } from 'react';
import _ from 'lodash';
import Player from './Player';

const styles = {
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        fontFamily: 'Roboto, sans-serif'
    },
    centerWrapper: {
        margin: 10,
        border: '1px solid #777',
        padding: 10,
        width: '100%'
    },
    centerTitle: {
        textAlign: 'center',
        fontWeight: 'bold'
    }
};

export default class Board extends Component {
    render() {
        return (
            <div style={styles.container}>
                {this.props.players.map(player => {
                    const isSelf = this.props.me.id === player.id;
                    return <Player
                        onClick={() => this.props.onClickCard(player.id)}
                        name={isSelf ? 'ME' : player.name}
                        role={player.role ? player.role : isSelf ? player._private.role : this.props.me._private.peeked[player.id]}
                        known={this.props.me._private.knows[player.id]}
                        shield={player.shield}
                        artifact={isSelf ? player._private.artifact : player.artifact}
                    />;
                })}
                <div style={styles.centerWrapper}>
                    <div style={styles.centerTitle}>Center Cards</div>
                    {_.times(this.props.game.centerCount, i => {
                        let name = i === 0 ? "Left" : i === 1 ? "Center" : i === 2 ? "Right" : "Alpha Wolf's";
                        return <Player
                            onClick={() => this.props.onClickCard(i)}
                            name={name}
                            role={this.props.me._private.peeked[i]}
                        />;
                    })}
                </div>
            </div>
        );
    }
}