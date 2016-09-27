const Deck = require('./Deck');
class Game {
    constructor() {
        this.privates = {};
        this.publics = {};
        this.decks = {};
    }

    mode(mode) {
        if (mode) {
            this.mode = mode;
            return this;
        } else {
            return this.mode;
        }
    }

    open(propName, propValue) {
        if (typeof propValue !== 'undefined') {
            this.publics[propName] = propValue;
            return this;
        } else {
            return this.publics[propName];
        }
    }

    hidden(propName, propValue) {
        if (typeof propValue !== 'undefined') {
            this.privates[propName] = propValue;
            return this;
        } else {
            return this.privates[propName];
        }
    }

    deck(deckName, deckValue) {
        if (typeof deckValue !== 'undefined') {
            this.decks[deckName] = deckValue;
            return this;
        } else {
            return this.decks[deckName];
        }
    }

    toJSON() {
        return JSON.stringify(Object.assign({}, this));
    }
}

Game.fromJSON = function(json){
    const game = new Game();
    Object.assign(game, json.parse(json));
    const decks = game.decks;
    game.decks = {};
    for (let deckname in decks) {
        if (decks.hasOwnProperty(deckname)){
            game.decks[deckname] = Deck.fromJSON(decks[deckname]);
        }
    }
    return game;
};

module.exports = Game;