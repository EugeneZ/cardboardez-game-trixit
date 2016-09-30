import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';

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

export default class Card extends Component {
    componentDidMount() {
        if (this.props.onZoom) {
            this.hammer = new Hammer.Manager(ReactDOM.findDOMNode(this), {
                recognizers: [[Hammer.Press], [Hammer.Pinch]]
            });
            this.hammer.on('press', ::this.onZoom);
            this.hammer.on('pinch', ::this.onZoom);
        }
    }

    componentWillUnmount() {
        if (this.hammer) {
            this.hammer.destroy();
        }
    }

    render() {
        const { card, onClick, width, highlight, labels } = this.props;

        return (
            <div style={Object.assign({}, styles.card, width && { width })}
                 onClick={onClick.bind(this, card)}>
                {labels && labels.top && <div style={styles.topLabel}>Played by {labels.top}</div>}
                <img style={Object.assign({}, styles.image, highlight ? styles.highlighted : {})}
                     src={`/assets/images/trixit/${card}.jpg`}/>
                {labels && labels.bottom && labels.bottom.length !== 0 &&
                <div style={styles.bottomLabel}>Votes: {labels.bottom.join(', ')}</div>}
            </div>
        );
    }

    onZoom() {
        if (this.props.onZoom) {
            this.props.onZoom(Object.assign({}, this.props, { onZoom: null }));
        }
    }
}