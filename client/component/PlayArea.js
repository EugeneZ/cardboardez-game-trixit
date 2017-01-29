import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import max from 'lodash/max';
import { FontIcon } from 'material-ui';
import { BottomNavigation, BottomNavigationItem } from 'material-ui';
import { Paper } from 'material-ui';
import { LinearProgress } from 'material-ui';
import { Dialog } from 'material-ui';
import { FlatButton } from 'material-ui';
import { TextField } from 'material-ui';
import Cards from './Cards';
import Card from './Card';
import Score from './Score';
import { getAlbum } from '../../configuration';

function getStyles(publicBaseURL) {
    return {
        wrapper: {
            backgroundImage: `url(${publicBaseURL}/bg.jpg)`,
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
};

@autobind
export default class PlayArea extends Component {
    state = {
        tab: 0,
        card: null,
        story: '',
        zoom: null,
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeToFit);
        this.resizeToFit();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeToFit);
    }

    componentDidUpdate() {
        this.resizeToFit();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.game.mode !== nextProps.game.mode) {
            if (nextProps.game.mode === 'voting') {
                this.setState({ tab: 1 });
            } else if (nextProps.game.mode === 'story') {
                this.setState({ tab: 0 });
            } else if (nextProps.game.mode === 'gameover') {
                this.setState({ tab: 2 });
            }
        }
    }

    render() {
        const styles = getStyles(this.props.publicBaseURL);
        const { game, players, me, storyteller } = this.getCommonValues(true);

        const progress = (players.map(p => p.score).sort((a, b) => b - a)[0] / 30) * 100;
        const unready = players.filter(player => !player.ready).map(player => player.name).join(', ');
        const unreadyIgnoringStoryteller = players.filter(player => !player.ready && player !== storyteller).map(player => player.name).join(', ');

        let instructions = 'Loading...';
        let color = {};
        if (game.mode === 'story') {
            if (storyteller === me) {
                instructions = 'Storyteller, select a card!';
                color = styles.actionNeeded;
            } else {
                instructions = `${storyteller.name} is the storyteller. Wait for them to select a card.`;
            }
        } else if (game.mode === 'suggestion') {
            if (storyteller === me) {
                instructions = `${unreadyIgnoringStoryteller} is picking a card for your story.`;
            } else if (me._private.suggestion) {
                instructions = `Wait for ${unreadyIgnoringStoryteller} to pick their cards.`;
            } else {
                instructions = `${storyteller.name}'s story is: "${game.story}"... Pick a card that matches!`;
                color = styles.actionNeeded;
            }
        } else if (game.mode === 'voting') {
            if (storyteller === me) {
                instructions = `${unreadyIgnoringStoryteller} is voting on which card they believe matches your story.`;
            } else if (me._private.vote) {
                instructions = `Waiting for ${unreadyIgnoringStoryteller} to vote for a card...`;
            } else {
                instructions = `Pick a card from the board that matches ${storyteller.name}'s story: "${game.story}"`;
                color = styles.actionNeeded;
            }
        } else if (game.mode === 'next') {
            if (me.ready) {
                instructions = `Waiting for ${unready} to click a card to continue...`;
            } else {
                instructions = `The scores have been updated! See the tale revealed below. Click any card and the game will continue.`;
                color = styles.actionNeeded;
            }
        } else if (game.mode === 'gameover') {
            const highscore = max(players.map(p => p.score));
            const winners = players.filter(player => player.score === highscore).map(player => player.name);
            instructions = `The game is over! The winner${winners.length > 1 ? 's are' : ' is'}: ${winners.join(', ')}`;
        }

        let highlight, labels = {};
        if (game.mode === 'next' || game.mode === 'gameover') {
            highlight = storyteller.suggestion;
            game.board.forEach(card => {
                labels[card] = {
                    top: players.find(player => player.suggestion === card).name,
                    bottom: players.filter(player => player.vote === card).map(player => player.name)
                };
            });
        } else if (game.mode === 'voting' && me._private.vote) {
            highlight = me._private.vote;
        }

        let main = <Cards cards={me._private.hand} onClick={this.onClickCardInHand} onZoom={this.onZoom}/>;
        if (this.state.zoom) {
            main = <Card width="95%" {...this.state.zoom}/>
        } else if (this.state.tab === 1) {
            main = <Cards cards={game.board || []} onClick={this.onClickCardOnBoard} highlight={highlight}
                          labels={labels} onZoom={this.onZoom}/>
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
            <div ref={node => this.node = node}>
                <div style={styles.wrapper}>
                    <LinearProgress mode="determinate" value={progress}/>
                    <Paper zDepth={4} style={Object.assign({}, styles.instructions, color)}>
                        {instructions}
                    </Paper>
                    {main}
                </div>
                <Paper zDepth={1} style={styles.bottomNavigaiton}>
                    <BottomNavigation selectedIndex={this.state.tab}>
                        <BottomNavigationItem label="My Hand"
                                              icon={<FontIcon className="fa fa-hand-stop-o"/>}
                                              onTouchTap={() => this.setState({ tab: 0 })}/>
                        <BottomNavigationItem label="Board" icon={<FontIcon className="fa fa-clone"/>}
                                              onTouchTap={() => this.setState({ tab: 1 })}/>
                        <BottomNavigationItem label="Score" icon={<FontIcon className="fa fa-star-o"/>}
                                              onTouchTap={() => this.setState({ tab: 2 })}/>
                    </BottomNavigation>
                </Paper>
                <Dialog title="Tell a story" actions={actions} modal={true} repositionOnUpdate={false}
                        autoDetectWindowHeight={true} autoScrollBodyContent={true}
                        contentStyle={styles.dialog.content} bodyStyle={styles.dialog.body}
                        style={styles.dialog.wrapper}
                        open={game.mode === 'story' && me === storyteller && this.state.card !== null}>
                    <TextField floatingLabelText="Your Story" value={this.state.story} onChange={this.onChangeStory}/>
                    <Card card={this.state.card} onClick={() => {
                    }} width="100%"/>
                </Dialog>
            </div>
        );
    }

    onClickCardInHand(card) {
        if (this.state.zoom) {
            return this.setState({ zoom: null });
        }

        const { game, me, storyteller } = this.getCommonValues();

        if (game.mode === 'story' && me === storyteller) {
            this.setState({ card });
        } else if (game.mode === 'suggestion' && me !== storyteller && !me._private.card) {
            this.sendAction({ card });
        } else if (game.mode === 'next') {
            this.sendAction({ card });
        }
    }

    onClickCardOnBoard(card) {
        if (this.state.zoom) {
            return this.setState({ zoom: null });
        }

        const { game, me, storyteller } = this.getCommonValues();

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

    sendAction(data) {
        this.props.onSendAction(data);
    }

    resizeToFit() {
        if (!this.node) {
            return;
        }
        this.node.style.height = (window.innerHeight - 110) + "px";
    }

    onZoom(props) {
        this.setState({ zoom: this.state.zoom ? null : props });
    }

    getCommonValues() {
        const { game, me } = this.props;
        const players = game._players;
        const storyteller = players.find(player => player.id === game.storyteller);

        return { game, me, storyteller, players };
    }
}