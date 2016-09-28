import React from 'react';

const styles = {
    card: {
        width: '29%',
        margin: '2%',
        position: 'relative'
    },
    image: {
        width: '100%',
        borderRadius: 10
    },
    highlighted: {
        border: '3px solid red'
    },
    topLabel: {
        position: 'absolute',
        top: 10, left: 10, right: 10,
        fontFamily: 'Roboto, sans-serif',
        background: 'white',
        padding: 10,
        opacity: .5
    },
    bottomLabel: {
        position: 'absolute',
        bottom: 10, left: 10, right: 10,
        fontFamily: 'Roboto, sans-serif',
        background: 'white',
        padding: 10,
        opacity: .5
    }
};

export default ({ card, onClick, width, highlight, labels }) =>

    <div style={Object.assign({},styles.card, width ? { width: width } : {})} onClick={onClick.bind(this, card)}>
        {labels && labels.top && <div style={styles.topLabel}>Played by {labels.top}</div>}
        <img style={Object.assign({}, styles.image, highlight ? styles.highlighted : {})} src={`/assets/images/trixit/${card}.jpg`}/>
        {labels && labels.bottom && labels.bottom.length !== 0&& <div style={styles.bottomLabel}>Votes: {labels.bottom.join(', ')}</div>}
    </div>