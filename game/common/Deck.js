const _ = require('lodash');

class Deck {
    constructor(length, options) {
        if (!length || typeof length !== 'number' || !isFinite(length) || length < 1) {
            throw new Error('Deck requires a length argument greater than zero');
        }

        this.length = length;
        this.options = options;

        this.cards = _.times(length, Number);
        this.shuffle();
    }

    toJSON() {
        return JSON.stringify({
            length: this.length,
            options: this.options,
            cards: this.cards
        });
    }

    draw() {
        return this.cards.pop();
    }

    shuffle() {
        this.cards = _.shuffle(this.cards);
    }

    putOnTop(card) {
        this.cards.push(card);
    }

    putOnBottom(card) {
        this.cards.unshift(card);
    }

    count() {
        return this.cards.length;
    }
};

Deck.fromJSON = function(json){
    const raw = JSON.parse(json);
    const deck = new Deck(raw.length, raw.options);
    deck.cards = raw.cards;
    return deck;
};

module.exports = Deck;