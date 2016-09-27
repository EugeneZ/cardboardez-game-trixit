const Player = require('./Player');

class Players {
    constructor() {
        this.a = [];
    }

    forPlayer(){
        this.a.forEach(player => {
            if (player.id === id) {
                cb(player);
            }
        })
    }

    /**
     * TODO: This isn't really JSON. Gotta figure out how to improve this. Or at least rename it to 'serialize'
     * @returns {string}
     */
    toJSON(){
        let json = '';
        this.a.forEach((player, i) => {
            json += player.toJSON ? player.toJSON() : JSON.stringify(player)
            if (i !== this.length - 1) {
                json += '_-_-_SEPARATOR_-_-_';
            }
        });
        json += ']';
        return json;
    }
}

Players.fromJSON = function(json) {
    const temp = json.split('_-_-_SEPARATOR_-_-_');
    const array = new Players();
    array.a.push(Player.fromJSON(temp));
    return array;
};

module.exports = Players;