const Game = require('./Game');

module.exports = class Player extends Game {
    constructor() {
        super();
        this.score = 0;
        this.hands = {};
    }

    hand(handName, handValue) {
        if (typeof handValue !== 'undefined') {
            this.hands[handName] = handValue;
            return this;
        } else {
            return this.hands[handName];
        }
    }
};