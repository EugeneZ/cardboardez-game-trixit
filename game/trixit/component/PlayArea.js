import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import FontIcon from 'material-ui/FontIcon';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import LinearProgress from 'material-ui/LinearProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Cards from './Cards';
import Card from './Card';
import Score from './Score';
import feathers from '../../../client/feathers';

function getStyles(context) {
    return {
        wrapper: {
            backgroundImage: 'url(/assets/images/trixit/bg.jpg)',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            paddingTop: context.muiTheme.appBar.height
        },

        instructions: {
            margin: 10,
            padding: 10
        },

        bottomNavigation: {
            position: 'absolute',
            left: 0, right: 0, bottom: 0
        },

        dialog: {
            width: 450
        }
    }
}

@autobind
export default class PlayArea extends Component {
    static contextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    };

    state = {
        tab: 0,
        card: null,
        story: ''
    };

    componentWillReceiveProps(nextProps) {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const nextGame = nextProps.games.filter(game => game.id === nextProps.params.id)[0];
        if (game.mode !== nextGame.mode) {
            if (nextGame.mode === 'voting') {
                this.setState({ tab: 1 });
            } else if (nextGame.mode === 'story') {
                this.setState({ tab: 0 });
            } else if (nextGame.mode === 'gameover') {
                this.setState({ tab: 2 });
            }
        }
    }

    render() {
        const styles = getStyles(this.context);
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players.map(player => {
            return Object.assign({}, player, { name: this.props.users.filter(p=>p.id === player.id)[0].name })
        });

        const progress = (players.map(p=>p.score).sort((a,b)=>a>b)[players.length - 1] / 30) * 100;
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const storyteller = players.filter(player => player.id === game.storyteller)[0];

        let instructions = 'Loading...';
        if (game.mode === 'story') {
            if (storyteller === me) {
                instructions = 'Storyteller, select a card!';
            } else {
                instructions = `${storyteller.name} is the storyteller. Wait for them to select a card.`;
            }
        } else if (game.mode === 'suggestion') {
            if (storyteller === me) {
                instructions = 'The others are picking a card for your story.';
            } else if (me._private.suggestion) {
                instructions = 'Wait for the others to pick their cards.';
            } else {
                instructions = `${storyteller.name}'s story is: "${game.story}"... Pick a card that matches!`;
            }
        } else if (game.mode === 'voting') {
            if (storyteller === me) {
                instructions = 'The others are voting on which card they believe matches your story.';
            } else if (me._private.vote) {
                instructions = 'Waiting for everyone else to vote for a card...';
            } else {
                instructions = `Pick a card from the board that matches ${storyteller.name}'s story: "${game.story}"`;
            }
        } else if (game.mode === 'next') {
            if (me.ready) {
                instructions = 'Waiting for everyone else to click a card to continue...';
            } else {
                instructions = `The scores have been updated! See the tale revealed below. Click any card and the game will continue once everyone has done so.`;
            }
        } else if (game.mode === 'gameover') {
            const scores = players.map(p=>p.score).sort();
            const winners = players.filter(player => player.score === scores[players.length - 1]).map(player => player.name);
            instructions = `The game is over! The winner${winners.length > 1 ? 's are' : ' is'}: ${winners.join(', ')}`;
        }

        let highlight, labels = {};
        if (game.mode === 'next' || game.mode === 'gameover') {
            highlight = storyteller.suggestion;
            game.board.forEach(card => {
                labels[card] = {
                    top: players.filter(player => player.suggestion === card)[0].name,
                    bottom: players.filter(player => player.vote === card).map(player => player.name)
                };
            });
        } else if (game.mode === 'voting' && me._private.vote) {
            highlight = me._private.vote;
        }

        let main = <Cards cards={me._private.hand} onClick={this.onClickCardInHand}/>;
        if (this.state.tab === 1) {
            main = <Cards cards={game.board || []} onClick={this.onClickCardOnBoard} highlight={highlight} labels={labels}/>
        } else if (this.state.tab === 2) {
            main = <Score players={players}/>
        }

        const actions = [
            <FlatButton
                label="Different Card"
                primary={false}
                onTouchTap={this.onCancelStory}
            />,
            <FlatButton
                label="Tell this story"
                primary={true}
                onTouchTap={this.onTellStory}
            />,
        ];

        return (
            <div style={styles.wrapper}>
                <LinearProgress mode="determinate" value={progress}/>
                <Paper zDepth={4} style={styles.instructions}>
                    {instructions}
                </Paper>
                {main}
                <Paper zDepth={1} style={styles.bottomNavigation}>
                    <BottomNavigation selectedIndex={this.state.tab}>
                        <BottomNavigationItem label="My Hand" icon={<FontIcon className="fa fa-hand-stop-o"/>}
                                              onTouchTap={() => this.setState({ tab: 0 })}/>
                        <BottomNavigationItem label="Board" icon={<FontIcon className="fa fa-clone"/>}
                                              onTouchTap={() => this.setState({ tab: 1 })}/>
                        <BottomNavigationItem label="Score" icon={<FontIcon className="fa fa-star-o"/>}
                                              onTouchTap={() => this.setState({ tab: 2 })}/>
                    </BottomNavigation>
                </Paper>
                <Dialog title="Tell the others a story about this card" actions={actions} modal={true}
                        style={styles.dialog}
                        open={game.mode === 'story' && me === storyteller && this.state.card !== null}>
                    <TextField floatingLabelText="Your Story" value={this.state.story} onChange={this.onChangeStory}/>
                    <Card card={this.state.card} onClick={()=> {
                    }} width="100%"/>
                </Dialog>
            </div>
        );
    }

    onClickCardInHand(card) {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players;
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const storyteller = players.filter(player => player.id === game.storyteller)[0];

        if (game.mode === 'story' && me === storyteller) {
            this.setState({ card });
        } else if (game.mode === 'suggestion' && me !== storyteller) {
            this.sendAction({ card });
        }
    }

    onClickCardOnBoard(card) {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const players = game._players;
        const me = players.filter(player => player.id === this.props.user.id)[0];
        const storyteller = players.filter(player => player.id === game.storyteller)[0];

        if (game.mode === 'voting' && me !== storyteller && card !== me._private.suggestion) {
            this.sendAction({ card });
        } else if (game.mode === 'next') {
            this.sendAction({ card });
        }
    }

    onChangeStory(e) {
        this.setState({ story: e.target.value });
    }

    onTellStory() {
        const { story, card } = this.state;
        this.sendAction({ story, card });
        this.setState({ card: null, story: '' });
    }

    onCancelStory() {
        this.setState({
            story: '',
            card: null
        });
    }

    /**
     * TODO: We are merging the game and user info here but this should be done by the server...
     * @param data
     */
    sendAction(data) {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        this.props.onSendAction(Object.assign({}, game, {
            user: feathers.get('user')
        }, data));
    }
}