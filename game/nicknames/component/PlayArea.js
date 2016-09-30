import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import FontIcon from 'material-ui/FontIcon';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const styles = {
    wrapper: {
        minHeight: '100%'
    },

    instructions: {
        margin: 10,
        padding: 10
    },

    dialog: {
        wrapper: {
            paddingTop:'0 !important',
            marginTop:'-65px !important',
            bottom: '0 !important',
            overflow: 'scroll !important',
            height: 'auto !important'
        },
        content: {
            width: '100%',
            maxWidth: '450px',
            maxHeight: '100% !important'
        },
        body: {
            maxHeight: '100% !important'
        }
    },

    actionNeeded: { backgroundColor: '#81C784' }
};

@autobind
export default class PlayArea extends Component {
    state = {
        word: null,
        clue: ''
    };

    render() {
        if (!this.props.user || !this.props.user.id) {
            return null;
        }
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players.map(player => {
            return Object.assign({}, player, { name: this.props.users.filter(p=>p.id === player.id)[0].name })
        });

        const progress = ([game.redwordsleft, game.bluewordsleft].sort((a, b)=>a < b)[0] / 9) * 100;
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const redleader = players.filter(player => player.id === game.redleader)[0];
        const blueleader = players.filter(player => player.id === game.blueleader)[0];
        const redteam = players.filter(player => player.red);
        const blueteam = players.filter(player => player.blue);
        const activeleader = game.redturn ? redleader : blueleader;
        const otherleader = game.redturn ? blueleader : redleader;

        let instructions = 'Loading...';
        let color = {};
        if (game.mode === 'clue') {
            if (me === activeleader) {
                instructions = 'Give a clue.';
                color = styles.actionNeeded;
            } else {
                instructions = `${activeleader.name} is giving a clue for the ${game.redturn ? 'red' : 'blue'} team.`;
            }
        } else if (game.mode === 'verify') {
            if (me === otherleader) {
                instructions = `${activeleader.name} wants to give this clue: "${me._private.clue}". Is that okay?`;
                color = styles.actionNeeded;
            } else if (me === activeleader) {
                instructions = `${otherleader.name} is deciding whether your clue is acceptable.`;
            } else {
                instructions = `${otherleader.name} is deciding whether ${activeleader.name}'s clue is acceptable.`;
            }
        } else if (game.mode === 'guess') {
            if ((game.redturn && redteam.indexOf(me) !== -1) || (!game.redturn && blueteam.indexOf(me) !== -1)) {
                instructions = `The clue is: "${game.clue}". Guess a card or pass!`;
                color = styles.actionNeeded;
            } else {
                instructions = `The clue is: "${game.clue}". The ${game.redturn ? 'red' : 'blue'} team is deciding on a guess.`;
            }
        } else if (game.mode === 'gameover') {
            if (game.assassinated) {
                instructions = `The game is over! The ${game.redturn ? 'red' : 'blue'} team LOST because they picked the assassin word!`;
            } else {
                instructions = `The game is over! The ${game.redwordsleft ? 'red' : 'blue'} team WINS!`
            }
        }

        return (
            <div>
                <div style={styles.wrapper}>
                    <LinearProgress mode="determinate" value={progress}/>
                    <Paper zDepth={4} style={Object.assign({}, styles.instructions, color)}>
                        {instructions}
                    </Paper>
                    <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                        {game.board.map(
                            word => {
                                const styles = { width: '19%', padding: '2% 0', margin: '0.5%', textAlign: 'center', fontFamily: '\'Francois One\', sans-serif', fontSize: 20};
                                const dictionary = me._private.words || game.revealed;
                                if (me._private.words) {
                                    if (dictionary[word] === 'assassin') {
                                        styles.backgroundColor = 'black';
                                        styles.color = 'white';
                                    } else if (dictionary[word] === 'red') {
                                        styles.backgroundColor = 'red';
                                        styles.color = 'white';
                                    } else if (dictionary[word] === 'blue') {
                                        styles.backgroundColor = 'blue';
                                        styles.color = 'white';
                                    } else if (dictionary[word] === 'neutral') {
                                        styles.backgroundColor = 'grey';
                                    }
                                }
                                return <Paper key={word} style={styles}>{game.revealed[word] ? '-' : word}</Paper>
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
}