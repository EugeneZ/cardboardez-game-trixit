import React, { Component } from 'react';

const styles = {
    container: {
        display: 'inline-block',
        border: '3px solid #333',
        borderRadius: 5,
        padding: 10,
        margin: 10
    },

    name: {

    },

    role: {

    },

    known: {

    },

    shield: {

    },

    artifact: {

    }
};

export default class Player extends Component {
    render() {
        const clickable = !this.props.shield;
        return (
            <div style={styles.container} onClick={clickable ? this.props.onClick : ()=>{}}>
                <div style={styles.name}>{this.props.name}</div>
                {this.props.role && <div style={styles.role}>{this.props.role}</div>}
                {this.props.known && <div style={styles.known}>known to you</div>}
                {this.props.shield && <div style={styles.shield}>shielded</div>}
                {this.props.artifact && <div style={styles.artifact}>{typeof artifact === 'string' ? artifact : 'artifact'}</div>}
            </div>
        );
    }
}