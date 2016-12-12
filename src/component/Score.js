import React from 'react';
import Paper from 'material-ui/Paper';
import { GridList, GridTile } from 'material-ui/GridList';

const styles = {
    wrapper: {
        background: 'transparent'
    },
    gridlist: {
        width: '100%'
    },
    score: {
        paddingTop: 30,
        fontSize: 60,
        textAlign: 'center'
    }
};

export default ({ players }) =>
    <Paper zDepth={0} style={styles.wrapper}>
        <GridList cellHeight={160} style={styles.gridlist}>
            {players.map(player =>
                <GridTile key={player.id} title={player.name}>
                    <div style={styles.score}>{player.score}</div>
                </GridTile>
            )}
        </GridList>
    </Paper>