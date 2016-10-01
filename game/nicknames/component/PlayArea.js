import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import FontIcon from 'material-ui/FontIcon';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const styles = {
    bg: {
        position: 'fixed',
        top: 0, bottom: 0, left: 0, right: 0
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

    card: {
        width: '19%',
        padding: '30px 0',
        margin: '3px 0.5%',
        textAlign: 'center',
        fontFamily: '\'Francois One\', sans-serif',
        fontSize: 20,
        cursor: 'pointer'
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

        const progress = ((9-[game.redwordsleft, game.bluewordsleft].sort((a, b)=>a < b)[0]) / 9) * 100;
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const redleader = players.filter(player => player.id === game.redleader)[0];
        const blueleader = players.filter(player => player.id === game.blueleader)[0];
        const redteam = players.filter(player => player.red);
        const blueteam = players.filter(player => player.blue);
        const redteamnames = redteam.map(player => player.name).join(',');
        const blueteamnames = blueteam.map(player => player.name).join(',');
        const myteammates = me.redleader ? redteamnames : (me.blueleader ? blueteamnames : '');
        const activeleader = game.redturn ? redleader : blueleader;
        const otherleader = game.redturn ? blueleader : redleader;
        const currentteamnames = game.redturn ? redteamnames : blueteamnames;
        const otherteamnames = game.redturn ? blueteamnames : redteamnames;

        let instructions = 'Loading...';
        let color = {};
        let bgcolor =  { backgroundColor:  me.redleader || me.red ? '#FFCDD2' : '#BBDEFB', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0};
        if (game.mode === 'clue') {
            if (me === activeleader) {
                instructions = (
                    <div>
                        <strong>{game.rejectedClue ? 'Your clue was rejected! ': ''}</strong>
                        Give a clue for {myteammates}. It should end with a number or "infinity".
                        <div>
                            <TextField value={this.state.clue} onChange={this.onChangeClue} floatingLabelText="Enter clue here"/>
                            &nbsp;
                            <RaisedButton label="Send Clue" onClick={this.onSendClue} primary={true}/>
                        </div>
                    </div>
                );
                color = styles.actionNeeded;
            } else {
                instructions = `${game.rejectedClue ? 'The clue was rejected! ' : ''}${activeleader.name} is giving a
                    clue for the ${game.redturn ? 'red' : 'blue'} team (${currentteamnames}).`;
            }
        } else if (game.mode === 'verify') {
            if (me === otherleader) {
                instructions = (
                    <div>{activeleader.name} wants to give this clue: "{me._private.clue}". Is that okay?
                        <div>
                            <RaisedButton label="No, it breaks the rules" onClick={this.onRejectClue}/>
                            &nbsp;
                            <RaisedButton label="Yes, this is a valid clue" onClick={this.onAcceptClue} primary={true}/>
                        </div>
                    </div>
                );
                color = styles.actionNeeded;
            } else if (me === activeleader) {
                instructions = `${otherleader.name} is deciding whether your clue is acceptable.`;
            } else {
                instructions = `${otherleader.name} is deciding whether ${activeleader.name}'s clue is acceptable.`;
            }
        } else if (game.mode === 'guess') {
            if ((game.redturn && redteam.indexOf(me) !== -1) || (!game.redturn && blueteam.indexOf(me) !== -1)) {
                instructions = (
                    <div>{currentteamnames}: The clue is: "{game.clue}". Guess a card{game.guesses ? ' or pass' : ''}!
                        {game.maxguesses ? ' ' + (game.maxguesses - game.guesses) + ' guesses left (not including bonus guess)' : ' Infinite guesses left... good luck.'}
                        {game.guesses ? <div><RaisedButton label="Pass" onClick={this.onPass}/></div>: ''}
                    </div>
                );
                color = styles.actionNeeded;
            } else {
                instructions = `The clue is: "${game.clue}". The ${game.redturn ? 'red' : 'blue'} team (${currentteamnames}) is deciding on a guess.`;
            }
        } else if (game.mode === 'gameover') {
            if (game.assassinated) {
                instructions = `The game is over! The ${game.redturn ? 'red' : 'blue'} team
                    (${currentteamnames + ',' + activeleader.name}) LOST because they picked the assassin word!
                    ${otherteamnames} and ${otherleader.name} WIN!`;
            } else {
                instructions = `The game is over! The ${game.redwordsleft ? 'blue' : 'red'} team
                    (${game.redwordsleft ? blueteamnames + ' and ' + blueleader.name : redteamnames + ' and ' + redleader.name}) WIN!`;
            }
        }

        return (
            <div>
                <div style={styles.bg}>
                    <div style={bgcolor}/>
                </div>
                <div style={styles.wrapper}>
                    <LinearProgress mode="determinate" value={progress}/>
                    <Paper zDepth={4} style={Object.assign({}, styles.instructions, color)}>
                        {instructions}
                    </Paper>
                    <div style={{ display: 'flex', flexWrap: 'wrap'}}>
                        {game.board.map(
                            word => {
                                const style = Object.assign({}, styles.card);
                                const dictionary = me._private.words || game.revealed;
                                if (dictionary[word] === 'assassin') {
                                    style.backgroundColor = '#263238';
                                    style.color = 'white';
                                } else if (dictionary[word] === 'red') {
                                    style.backgroundColor = '#EF5350';
                                } else if (dictionary[word] === 'blue') {
                                    style.backgroundColor = '#42A5F5';
                                } else if (dictionary[word] === 'neutral') {
                                    style.backgroundColor = '#CFD8DC';
                                }
                                if (game.revealed[word] === 'red') {
                                    style.backgroundColor = '#D50000';
                                } else if (game.revealed[word] === 'blue') {
                                    style.backgroundColor = '#0D47A1';
                                }
                                return <Paper key={word} style={style} onClick={()=>this.onPickWord(word)}>{game.revealed[word] ? '' : word}</Paper>
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
    }

    onRejectClue() {
        this.sendAction({ verified: false });
    }

    onAcceptClue() {
        this.sendAction({ verified: true });
    }

    onPickWord(word) {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players.map(player => {
            return Object.assign({}, player, { name: this.props.users.filter(p=>p.id === player.id)[0].name })
        });
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const redteam = players.filter(player => player.red);
        const blueteam = players.filter(player => player.blue);
        const activeTeam = game.redturn ? redteam : blueteam;
        if (game.mode === 'guess' && activeTeam.indexOf(me) !== -1) {
            this.sendAction({ word });
        }
    }

    onPass() {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players.map(player => {
            return Object.assign({}, player, { name: this.props.users.filter(p=>p.id === player.id)[0].name })
        });
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const redteam = players.filter(player => player.red);
        const blueteam = players.filter(player => player.blue);
        const activeTeam = game.redturn ? redteam : blueteam;

        if (game.mode === 'guess' && activeTeam.indexOf(me) !== -1 && game.guesses) {
            this.sendAction({ pass: true });
        }
    }
}