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
        const me = game._players.filter(player => player.id === this.props.user.id)[0];
        console.log(game, me);

        let actionElement = null;
        if (game.mode === 'story'){
            if (game.storyteller === me.id) {
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
                    {me._private.hand.map((card, i) =>
                        <div key={i} style={styles.card}><img style={styles.image} src={`/assets/images/trixit/${card}.jpg`}/></div>
                    )}
                </div>
            </div>
        );
    }
}