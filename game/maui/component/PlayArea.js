import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TouchBackend from 'react-dnd-touch-backend';
import autobind from 'autobind-decorator';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Tile from './Tile';
import MapTile from './MapTile';

const styles = {
    bgwrapper: {
        position: 'fixed',
        top: 0, bottom: 0, left: 0, right: 0
    },

    bg: {
        backgroundImage: 'url(/assets/images/maui/bg.jpg)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    wrapper: {
        minHeight: '100%',
        position: 'relative',
        zIndex: 1
    },

    instructions: {
        margin: 10,
        padding: 10
    },

    hand: {
        display: 'flex'
    },

    mapWrapper: {
        border: '1px solid black',
        borderWidth: '1px 0 0 1px',
        display: 'flex',
        flexWrap: 'wrap'
    },

    tile: {},

    actionNeeded: { backgroundColor: '#81C784' }
};

@autobind
@DragDropContext('draggable' in document.createElement('span') ? HTML5Backend : TouchBackend)
export default class PlayArea extends Component {
    state = {
        activeTile: null
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeToFit);
        this.resizeToFit();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeToFit);
    }

    render() {
        if (!this.props.user || !this.props.user.id) {
            return null;
        }
        const game = this.props.games.find(game => game.id === this.props.params.id);
        const players = game._players.map(
            player => Object.assign({ name: this.props.users.find(p=>p.id === player.id).name }, player)
        );

        const progress = (game.map.filter(tile => tile).length / 36) * 100;
        const me = players.find(player => player.id === this.props.user.id);
        const activePlayer = players.find(player => player.id === game.turn);

        let instructions = 'Loading...';
        let color = {};

        if (game.mode === 'start') {
            if (me === activePlayer) {
                instructions = `It's your turn to select a starting position. Click one of the edges of the board.`;
                color = styles.actionNeeded;
            } else {
                instructions = `${activePlayer.name} is picking a starting position.`;
            }
        } else if (game.mode === 'turn') {
            if (me === activePlayer) {
                instructions = (
                    <div>It's your turn to place a tile! Select a tile to try it out. Touch the tile on the board once
                        it has been placed to rotate it until you're happy, or select another tile and try again. Once
                        you are satisfied:
                        <RaisedButton label="Confirm Placement" disabled={!this.state.activeTile} onClick={this.onTurn}/>
                    </div>
                );
                color = styles.actionNeeded;
            } else {
                instructions = `${activePlayer.name} is taking their turn.`;
            }
        } else if (game.mode === 'gameover') {
            const winners = players.filter(player => game.winners.includes(player.id)).map(player => player.name);
            instructions = `The game is over! The winner${winners.length > 1 ? 's are' : ' is'} ${winners.join(',')}!`;
        }

        return (
            <div>
                <div style={styles.bgwrapper}>
                    <div style={styles.bg}/>
                </div>
                <div style={styles.wrapper}>
                    <LinearProgress mode="determinate" value={progress}/>
                    <Paper zDepth={4} style={Object.assign({}, styles.instructions, color)}>
                        {instructions}
                    </Paper>
                    <div style={styles.hand}>
                        {me._private.hand.map(
                            tile => <Tile key={tile} tile={tile} onClick={this.onSelectTile}/>
                        )}
                    </div>
                    <div style={styles.mapWrapper} ref="map">
                        {game.map.map(
                            (tile, key) => {
                                return <MapTile key={key} tile={tile} isPosition={me.position === key}/>
                            }
                        )}
                    </div>
                </div>
            </div>
        );
    }

    sendAction(data) {
        this.props.onSendAction(data);
    }

    onChangeClue(e) {
        this.setState({ clue: e.target.value });
    }

    onSendClue() {
        this.sendAction({ clue: this.state.clue });
        this.setState({ clue: '' });
    }

    onRejectClue() {
        this.sendAction({ verified: false });
    }

    onAcceptClue() {
        this.sendAction({ verified: true });
    }

    onPickWord(word) {
        const game = this.props.games.find(game => game.id === this.props.params.id);
        const me = game._players.find(player => player.id === this.props.user.id);
        const isMyTurn = (me.red && game.redturn) || (me.blue && !game.redturn);

        if (game.mode === 'guess' && isMyTurn && !game.revealed[word]) {
            this.sendAction({ word });
        }
    }

    onPass() {
        const game = this.props.games.find(game => game.id === this.props.params.id);
        const me = game._players.find(player => player.id === this.props.user.id);
        const isMyTurn = (me.red && game.redturn) || (me.blue && !game.redturn);

        if (game.mode === 'guess' && isMyTurn !== -1 && game.guesses) {
            this.sendAction({ pass: true });
        }
    }

    resizeToFit() {
        if (!this.refs.map) {
            return;
        }
        this.refs.map.style.height = this.refs.map.clientWidth + "px";
    }
}