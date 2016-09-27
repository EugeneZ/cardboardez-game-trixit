import React, { Component } from 'react';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';

const styles = {
    wrapper: {
        backgroundImage: 'url(/assets/images/trixit/bg.jpg)',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        paddingTop: 50
    },
    hand: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    card: {
        width: '29%',
        margin: '2%'
    },
    image: {
        width: '100%',
        borderRadius: 10
    }
};

export default class PlayArea extends Component {
    render() {
        const game = this.props.games.filter(game => game.id === this.props.params.id)[0];
        const gamestate = JSON.parse(game.gamestate);
        const players = game.playerstate.split('_-_-_SEPARATOR_-_-_').map(json => {
            try {
                return JSON.parse(json)
            } catch(e){}
        }).filter(player => player);
        const me = players.filter(player => player.id === this.props.user.id)[0];
        console.log(players, gamestate, me);

        let actionElement = null;
        if (gamestate.mode === 'story'){
            if (players[gamestate.publics.storyteller].id === me.id) {
                actionElement = (
                    <div style={styles.actionWrapper}>
                        
                    </div>
                )
            }
        }

        return (
            <div style={styles.wrapper}>
                <div style={styles.players}>

                </div>
                <div style={styles.hand}>
                    {me.hands.hand.map((card, i) =>
                        <div key={i} style={styles.card}><img style={styles.image} src={`/assets/images/trixit/${card}.jpg`}/></div>
                    )}
                </div>
            </div>
        );
    }
}