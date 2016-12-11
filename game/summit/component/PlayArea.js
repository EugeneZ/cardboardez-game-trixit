import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import FontIcon from 'material-ui/FontIcon';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import FlatButton from 'material-ui/FlatButton';
import Board from './Board';

const styles = {
    wrapper: {
        backgroundImage: 'url(/assets/images/summit/bg.jpg)',
        paddingBottom: 44,
        minHeight: '100%'
    },

    instructions: {
        margin: 10,
        padding: 10
    },

    bottomNavigaiton: {
        position: 'fixed',
        left: 0, bottom: 0, width: '100%'
    },

    dialog: {
        wrapper: {
            paddingTop: '0 !important',
            marginTop: '-65px !important',
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

const roleDetails = {
    doppleganger: {
        instructions: `Doppleganger, you must choose another player. You will see their card and become that role. If your role has night actions or knowledge associated with it, it will be given to you soon.`,
        actionNeeded: { player: true, self: false, optional: false }
    },
    sentinel: {
        instructions: `Sentinel, you may place a shield on any other player, preventing their card from being moved or viewed.`,
        actionNeeded: { player: true, self: false, optional: true }
    },
    alphaWolf: {
        instructions: `Alpha Wolf, you must choose another player. That player will receive the special fourth center card (which started as a Werewolf).`,
        actionNeeded: { player: true, self: false, optional: false }
    },
    mysticWolf: {
        instructions: `Mystic Wolf, you may choose another player. You will see that player's card.`,
        actionNeeded: { player: true, self: false, optional: true }
    },
    thing: {
        instructions: `Thing, you may choose a player to your left or right, and that player will know you "tapped" them.`,
        actionNeeded: { player: true, self: false, optional: true, leftOrRightPlayerOnly: true }
    },
    seer: {
        instructions: `Seer, you may choose another player OR two center cards, and look at them.`,
        actionNeeded: { player: true, self: false, optional: true, center: 2, playerOrCenter: true }
    },
    apprenticeSeer: {
        instructions: `Apprentice Seer, you may choose a center card, and look at it.`,
        actionNeeded: { player: false, self: false, optional: true, center: true }
    },
    paranormalInvestigator: {
        instructions: `Paranormal Investigator, you may choose another player and look at their card. If it's a Werewolf, Tanner, or Vampire, you become that role. If it's not, you may repeat this process once.`,
        actionNeeded: { player: true, self: false, optional: true }
    },
    paranormalInvestigator2: {
        instructions: `Paranormal Investigator, you may choose another player and look at their card. If it's a Werewolf, Tanner, or Vampire, you become that role.`,
        actionNeeded: { player: true, self: false, optional: true }
    },
    robber: {
        instructions: `Robber, you must choose another player and swap cards with them. You will then see your new card.`,
        actionNeeded: { player: true, self: false, optional: false }
    },
    witch: {
        instructions: `Witch, you may look at a center card. If you do, you must swap that card with any player of your choice (possibly your own).`,
        actionNeeded: { player: false, self: false, optional: true, center: true }
    },
    witchSwaps: {
        instructions: `Witch, you must now choose whose card to swap with the card you looked at.`,
        actionNeeded: { player: true, self: true, optional: false }
    },
    troublemaker: {
        instructions: `Troublemaker, choose two other players. Their cards will be swapped.`,
        actionNeeded: { player: 2, self: false, optional: true }
    },
    villageIdiot: {
        instructions: `Village Idiot, you may choose to move all other players' cards without a shield left or right. Select the direction desired or pass.`,
        actionNeeded: { player: false, self: false, optional: true, chooseLeftOrRight: true }
    },
    auraSeer: {
        instructions: `Aura Seer, prepare to receive the names of the players who looked at or moved cards so far (if any).`,
        actionNeeded: { player: false, self: false, optional: true }
    },
    drunk: {
        instructions: `Drunk, you must choose a center card. You will swap with this card without looking at it.`,
        actionNeeded: { player: false, self: false, optional: false, center: true }
    },
    insomniac: {
        instructions: `Insomniac, prepare to receive the name of your current role.`,
        actionNeeded: { player: false, self: false, optional: true }
    },
    squire: {
        instructions: `Squire, prepare to see the cards of the werewolf players you have identified (if any).`,
        actionNeeded: { player: false, self: false, optional: true }
    },
    beholder: {
        instructions: `Beholder, prepare to see the card of the seer you identified (if any).`,
        actionNeeded: { player: false, self: false, optional: true }
    },
    revealer: {
        instructions: `Revealer, you may choose a player whose card will be flipped. If it is a Werewolf, Tanner, or Vampire, it will be flipped back down and only you will know about it!`,
        actionNeeded: { player: true, self: false, optional: true }
    },
    curator: {
        instructions: `Curator, you may choose any player. That player will receive a random artifact, and only that player will know which artifact.`,
        actionNeeded: { player: true, self: true, optional: true }
    },
};

@autobind
export default class PlayArea extends Component {
    state = {
        tab: 0,
        currentTarget: null
    };

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
        window.addEventListener('resize', this.resizeToFit);
        this.resizeToFit();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeToFit);
    }

    componentDidUpdate() {
        this.resizeToFit();
    }

    render() {
        if (!this.props.user || !this.props.user.id) {
            return null;
        }

        const { game, players, me } = this.getCommonValues(true);

        const progress = (game.order.indexOf(game.mode) + 1 / game.order.length) * 100;

        const itsMyTurn = game.mode === me._private.role || (['doppleganger', 'paranormalInvestigator', 'witch'].includes(game.mode) && game.mode.indexOf(me._private.role) === 0);
        const color = itsMyTurn ? styles.actionNeeded : {};

        let instructions = 'Wait...';
        let actionNeeded = null;

        if (game.mode === 'day') {
            instructions = `When you are ready, tap the name of the player who you want to vote to kill. No one will see
            who you voted for until the game is over. You can change your vote at any time until the last person has voted.`;
        } else if (game.mode === 'gameover') {
            instructions = `The game is over! `;

            if (!game.winners.length) {
                instructions += `No one won! `;
            } else {
                const winnersNames = game.winners.map(winnerId => players.find(player => player.id === winnerId).name);
                instructions += `${winnersNames.join(', ')} won! `;
            }

            if (!game.deadPlayers.length) {
                instructions += `No one died! `;
            } else {
                const deadPlayersNames = game.deadPlayers.map(player => players.find(p => p.id === player.id).name);
                instructions += `${deadPlayersNames.join(', ')} died. `;
            }

            instructions += `Everyone's roles and other info are visible below.`;
        } else if (itsMyTurn) {
            instructions = roleDetails[game.mode].instructions;
            actionNeeded = roleDetails[game.mode].actionNeeded;
        }

        let main = <Board players={players} game={game} me={me} onClickCard={this.onClickCard.bind(this, actionNeeded)}/>;
        if (this.state.tab === 1) {
            main = 'Coming soon...';
        }

        const readyButton = !actionNeeded && <FlatButton label="Ready" primary={true} onTouchTap={this.onDoNothing}/>
        const passButton = actionNeeded && actionNeeded.optional && <FlatButton label="Do Nothing" primary={true} onTouchTap={this.onDoNothing}/>

        const leftAndRightButtons = actionNeeded && actionNeeded.chooseLeftOrRight && [
            <FlatButton
                label="Move Cards Left"
                primary={true}
                onTouchTap={this.onMoveLeft}
            />,
            <FlatButton
                label="Move Cards Right"
                primary={true}
                onTouchTap={this.onMoveRight}
            />,
        ];

        return (
            <div>
                <div style={styles.wrapper}>
                    <LinearProgress mode="determinate" value={progress}/>
                    <Paper zDepth={4} style={Object.assign({}, styles.instructions, color)}>
                        {instructions}{passButton}{leftAndRightButtons}{readyButton}
                    </Paper>
                    {main}
                </div>
                <Paper zDepth={1} style={styles.bottomNavigaiton}>
                    <BottomNavigation selectedIndex={this.state.tab}>
                        <BottomNavigationItem label="Main" icon={<FontIcon className="fa fa-clone"/>}
                                              onTouchTap={() => this.setState({ tab: 0 })}/>
                        <BottomNavigationItem label="Log" icon={<FontIcon className="fa fa-hand-stop-o"/>}
                                              onTouchTap={() => this.setState({ tab: 1 })}/>
                    </BottomNavigation>
                </Paper>
            </div>
        );
    }

    onClickCard(actionNeeded, card) {
        const isCenter = card.toString().length === 1;
        let data = null;

        if ((typeof actionNeeded.player === 'boolean' && !isCenter) || (typeof actionNeeded.center === 'boolean' && isCenter)) {
            data = { target: card };
        } else if (typeof actionNeeded.player === 'number' || typeof actionNeeded.center === 'number') {
            if (this.state.currentTarget && isCenter ? this.state.currentTarget.toString() === 1 : this.state.currentTarget.toString() > 1) {
                data = {
                    target1: this.state.currentTarget,
                    target2: card
                };
            } else {
                this.setState({ currentTarget: card });
            }
        }

        if (data) {
            this.sendAction({ target: card });
        }
    }

    sendAction(data) {
        this.props.onSendAction(data);
    }

    onDoNothing() {
        this.sendAction();
    }

    onMoveLeft() {
        this.sendAction({ target: 'reverse' });
    }

    onMoveRight() {
        this.sendAction({ target: 'right' });
    }

    resizeToFit() {
        if (!this.node) {
            return;
        }
        this.node.style.height = (window.innerHeight - 110) + "px";
    }

    getCommonValues(playersNeedNames) {
        const game = this.props.games.find(game => game.id === this.props.params.id);
        const players = !playersNeedNames ? game._players : game._players.map(
            player => Object.assign({ name: this.props.users.find(p => p.id === player.id).name }, player)
        );
        const me = players.find(player => player.id === this.props.user.id);

        return { game, me, players };
    }
}