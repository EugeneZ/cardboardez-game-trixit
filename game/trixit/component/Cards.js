import React from 'react';
import Card from './Card';

const styles = {
    cards: {
        display: 'flex',
        flexWrap: 'wrap',
    }
};

export default ({ cards, onClick, highlight, labels }) =>

    <div style={styles.cards}>
        {cards.map((card, i) =>
            <Card key={i} card={card} onClick={onClick} highlight={highlight === card} labels={labels ? labels[card] : null}/>
        )}
    </div>