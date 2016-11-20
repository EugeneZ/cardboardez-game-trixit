import React from 'react';

const styles = {
    tile: {
        width: '30%',
        margin: '0 1%'
    },

    img: {
        maxWidth: '100%'
    }
};

export default ({ tile, onClick }) =>
    <div style={styles.tile} onClick={()=>onClick(tile)}>
        <img ref="image" style={styles.img} src={`/assets/images/maui/${tile}.png`}/>
    </div>