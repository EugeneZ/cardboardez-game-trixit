const _ = require('lodash');
const tiles = require('./common').tiles;
const edgeTranslation = require('./common').edgeTranslation;

function forPlayer(id, cb, { _players }) {
    for (let i = 0; i < _players.length; i++) {
        if (_players[i].id === id) {
            cb(_players[i]);
            break;
        }
    }
}

function buildStartPositions(size) {
    let startPositions = _.times(size * 2, i => Math.floor(i / 2));
    startPositions = startPositions.concat(
        _.times(size * 2, i => (size * (Math.floor(i / 2) + 1)) - 1)
    );
    startPositions = startPositions.concat(
        _.times(size * 2, i => ((size * size) - 1) - Math.floor(i / 2))
    );
    startPositions = startPositions.concat(
        _.times(size * 2, i => (size * size) - (size * (Math.floor(i / 2) + 1)))
    );

    return startPositions.unshift();
}

function getStartingPosition(startPosition, size) {
    return {
        position: startPositions[startPosition],
        edge: (Math.floor(startPosition / (size * 2)) * 2) + (startPosition % 2)
    }
}

function doMovePosition(position, edge, tile, game, player) {
    const size = game.options.size;
    const moveToEdge = tiles[tile.tile][edge + ((tile.orientation % 4) * 2)] - ((tile.orientation % 4) * 2);
    const direction = Math.floor(moveToEdge / 2);
    const resultIfDead = { position, edge: edgeTranslation[moveToEdge], deaths: [player.id] };
    let dead = false;

    // check for opposite-direction collisions
    if (game.options.collisions) {
        game._players.filter(p=>p !== player).forEach(p => {
            if (p.position.position === position && p.position.edge === moveToEdge) {
                resultIfDead.deaths.push(p.id);
                dead = true;
            }
        });

        if (dead) {
            return resultIfDead;
        }
    }

    let newPosition = position;

    if (direction === 0) { // up
        if (position < size) {
            return resultIfDead;
        }
        newPosition -= size;
    } else if (direction === 1) { // right
        if ((position + 1) % size === 0) {
            return resultIfDead;
        }
        newPosition += 1;
    } else if (direction === 2) { // down
        if (position >= (size * size) - size) {
            return resultIfDead;
        }
        newPosition += size;
    } else { // left
        if (position % size === 0) {
            return resultIfDead;
        }
        newPosition -= 1;
    }

    // check for following same path as another ship
    game._players.filter(p=>p !== player).forEach(p => {
        if (p.position.position === newPosition && p.position.edge === edgeTranslation[moveToEdge]) {
            resultIfDead.deaths.push(p.id);
            dead = true;
        }
    });

    if (dead) {
        return resultIfDead;
    }

    return {
        position: newPosition,
        edge: edgeTranslation[moveToEdge]
    }
}

module.exports.setup = function (game) {
    game.options = game.options || { size: 6, collisions: true };
    const pile = game._hidden.tiles = _.shuffle(_.times(35, i => i + 1));
    game.map = _.times(36, _.constant(0));
    game._players.forEach((player, i, players) => {
        player.playerToLeft = players[i === players.length - 1 ? 0 : i + 1].id;
        const hand = player._private.hand = [];
        hand.push(pile.pop());
        hand.push(pile.pop());
        hand.push(pile.pop());
    });
    game.turn = game._players[_.random(game._players.length - 1)].id;
    game.mode = 'start';
};

module.exports.start = function (start, game) {
    if (!start.start || start.start < 0 || start.start > 48 || game.turn !== game.turn) {
        throw new Error(`Cheating (or bug?) detected for player ${turn.player.id}`);
    }

    const existing = game._players.includes(player => player.start === start.start);
    if (existing) {
        throw new Error(`Cheating (or bug?) detected for player ${turn.player.id}`);
    }

    const startPositions = buildStartPositions(game.options.size);

    forPlayer(start.player.id, player => {
        player.position = getStartingPosition(startPositions[start.start], game.options.size);
        game.turn = player.playerToLeft;
        if (game._players.includes(p => p.id === game.turn && p.position)) {
            game.mode = 'turn';
        }
    }, game);
};

module.exports.turn = function (turn, game) {
    if (!turn.tile || !turn.orientation || turn.player.id !== game.turn) {
        throw new Error(`Cheating (or bug?) detected for player ${turn.player.id}`);
    }

    // keep track of who started alive incase everyone dies
    const livePlayers = game._players.filter(player => !player.dead);

    // place the tile, for now
    forPlayer(game.turn, player => {
        game.map[player.position.position] = { tile: turn.tile, orientation: turn.orientation };
    });

    // move all players (those not next to the new tile won't do much)
    game._players.forEach(player => {
        let { position, edge } = player.position;
        let tile, deaths = [], newDeaths, toomany, loops = 0;

        do {
            loops++;
            if (loops > game.options.size * game.options.size) {
                toomany = true;
                break;
            }
            tile = game.map[position];
            if (tile) {
                ({ position, edge, newDeaths } = doMovePosition(position, edge, tile, game, player));
                deaths = deaths.concat(newDeaths);
            }
        } while (tile);

        if (toomany) {
            deaths.push(player.id);
        }

        if (deaths && deaths.length) {
            if (deaths.includes(game.turn)) {
                // if the player's submitted move killed them, check if there were any moves that didn't kill them...
                // this is pretty computationally-intensive. Hopefully the client is doing this, this is just for rule
                // safety.
            }
            deaths.forEach(id => {
                forPlayer(id, p => {
                    p.dead = true;
                    p.dragon = false;
                    game._hidden.tiles = _.concat(p._private.hand, game._hidden.tiles);
                    p._private.hand = [];
                }, game);
            });
        } else {
            player.position = { position, edge };
        }
    });

    // check for game end
    const stillLivePlayers = game._players.filter(player => !player.dead);
    if (!stillLivePlayers.length) {
        game.mode = 'gameover';
        game.winners = livePlayers.map(player => player.id);
        return;
    } else if (stillLivePlayers.length === 1 || game.map.filter(_.identity).length + 1 >= game.options.size * game.options.size) {
        game.mode = 'gameover';
        game.winners = stillLivePlayers.map(player => player.id);
        return;
    }

    // draw tiles & dragon tile
    let playerToDraw = game._players.find(player => player.id === game.turn);
    if (game._players.includes(player => player.dragon)) {
        playerToDraw = game._players.find(player => player.dragon);
    }

    while (game._hidden.tiles.length && game._players.includes(player => !player.dead && player._private.hand.length < 3)) {
        if (playerToDraw._hidden.hand < 3 && !playerToDraw.dead) {
            playerToDraw._hidden.hand.push(game._hidden.tiles.pop());
        }
        playerToDraw = game._players.find(player => player.id === playerToDraw.playerToLeft);
    }

    if (!game._hidden.tiles.length && playerToDraw._private.hand.length < 3) {
        game._players.forEach(player => player.dragon = false);
        playerToDraw.dragon = true;
    }

    // next turn
    forPlayer(game.turn, player => {
        do {
            game.turn = player.playerToLeft;
        } while (game._players.includes(p => p.id === game.turn && p.dead));
    });
};