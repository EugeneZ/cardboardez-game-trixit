import React, { Component } from 'react';
import autobind from 'autobind-decorator';

const styles = {
    tile: {
        width: '16.3%',
        border: '1px solid black',
        borderWidth: '0 1px 1px 0',
        padding: 0,
        margin: 0,
        cursor: 'pointer'
    },

    img: {
        maxWidth: '100%'
    }
};

@autobind
export default class MapTile extends Component {
    state = {
        orientation: 0
    };

    render() {
        const { tile, isPosition } = this.props;
        const orientation = isPosition ? this.state.orientation : tile.orientation;
        return (
            <div style={Object.assign({ transform: `rotate(${orientation / 4}turn)`, backgroundColor: isPosition ? 'green' : '' }, styles.tile)}
                 onClick={this.onClick}>
                <img ref="image" style={styles.img} src={`/assets/images/maui/${tile.tile}.png`}/>
            </div>
        );
    }

    onClick() {
        this.setState({
            orientation: this.state.orientation + 1
        });
    }
}