var _ = require('lodash');

var GameMath = {
    randomUniqueArray: function (length, min, max) {
        var rands = [], tries = 0;
        do {
            if (tries++ > 100) {
                throw new Error('Had a problem generating unique random numbers');
            }
            rands = rands.push(_.random(min, max)) && _.uniq(rands);
        } while (rands.length !== length);
        return rands;
    },

    pullFromDeck: function(length, min, max, excluded) {
        var deck = [];
        for (var i = min; i <= max; i++) {
            if (excluded.indexOf(i) === -1) {
                deck.push(i);
            }
        }
        deck = _.shuffle(deck);
        return deck.slice(0, length);
    },

    pullFromSet: function(length, collection, excluded) {
        return _(collection).difference(excluded).shuffle().slice(0, length).value();
    },

    getFullDeck: function(min, max) {
        var deck = [];
        for (var i = min; i <= max; i++) {
            deck.push(i);
        }
        return deck;
    }
};

module.exports = GameMath;