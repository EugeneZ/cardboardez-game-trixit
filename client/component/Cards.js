import React from 'react';
import Card from './Card';

const styles = {
    cards: {
        display: 'flex',
        flexWrap: 'wrap',
    }
};

export default ({ cards, onClick, highlight, labels, onZoom, imageUrls }) =>

    <div style={styles.cards}>
        {cards.map((card, i) =>
            <Card key={i} card={card} onClick={onClick} highlight={highlight === card} onZoom={onZoom}
                  labels={labels ? labels[card] : null} imageUrls={imageUrls}/>
        )}
    </div>