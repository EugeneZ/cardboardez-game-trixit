const _ = require('lodash');

const scoreNeededToWinByPlayerCount = {
    2: 7,
    3: 5,
    4: 4,
    5: 3,
    6: 3,
    7: 2,
    8: 2
};

function getRandomInt(max) {
    return Math.floor(Math.random() * (Math.floor(max) + 1));
}

function forPlayer(id, cb, game) {
    game._players.forEach(player => {
        if (player.id === id) {
            cb(player);
        }
    });
}

function discardCard(player, card) {
    player.discards.push(player._private.hand.splice(player._private.hand.indexOf(card), 1)[0]);
}

function doNewRound(game) {
    game._hidden.deck = _.shuffle([1,1,1,1,1,2,2,3,3,4,4,5,5,6,7,8]);
    game._hidden.hidden = game._hidden.pop();
    game.public = [];

    if (game._players.length === 2) {
        _.times(3, ()=> game.public.push(game._hidden.deck.pop()));
    }

    game._players.forEach(player => {
        player.ready = false;
        player.dead = false;
        player.protected = false;
        player.discards = [];
        player._private.hand.push(game._hidden.deck.pop());
    });

    game.mode = 'turn';
}

module.exports.setup = function(game){
    game.turn = game.players[getRandomInt(game.players.length-1)];
    game.winners = null;
    game._players.forEach((player, i, players) => {
        player.score = 0;
        player._private.hand = [];
        player.playerToLeft = i === players.length - 1 ? players[0].id : players[i+1].id;
    });
    doNewRound(game);
};

module.exports.turn = function(turn, game){
    if (turn.user.id !== game.turn || !turn.card) {
        throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
    }

    let livePlayers = game._players.filter(player => !player.dead);
    const targetablePlayers = livePlayers.filter(player => !player.protected);
    let thisPlayer = livePlayers.filter(player => player.id === turn.user.id)[0];
    thisPlayer.guess = null;
    thisPlayer.protected = false;

    // card effect
    const target = targetablePlayers.filter(player => player.id === turn.target)[0];
    thisPlayer.target = target && target.id;
    game.target = target && target.id;
    game.lastPlayed = turn.card;
    discardCard(thisPlayer, turn.card);
    if (turn.card === 1) {
        if ((!target && targetablePlayers.length) || turn.guess === 1){
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (targetablePlayers.length) {
            thisPlayer.guess = turn.guess;
            if (target._private.hand[0] === thisPlayer.guess) {
                target.dead = true;
                discardCard(target, thisPlayer.guess);
            }
        }
    } else if (turn.card === 2) {
        if (!target && targetablePlayers.length){
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (target !== thisPlayer) {
            thisPlayer.peek = target._private.hand[0];
        }
    } else if (turn.card === 4) {
        thisPlayer.protected = true;
    } else if (turn.card === 5) {
        if (!target || thisPlayer._private.hand.indexOf(7) !== -1){
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (game._hidden.deck.length) {
            target._private.hand = [game._hidden.deck.pop()];
        } else {
            target._private.hand = [game._hidden.hidden];
        }
    } else if (turn.card === 6) {
        if ((!target && targetablePlayers.length) || thisPlayer._private.hand.indexOf(7) !== -1) {
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (target !== thisPlayer) {
            const temp = target._private.hand;
            target._private.hand = thisPlayer._private.hand;
            thisPlayer._private.hand = temp;
        }
    }  else if (turn.card === 8) {
        throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
    }// countess doesn't need anything special

    // check for round end
    livePlayers = game._players.filter(player => !player.dead);
    if (game._hidden.deck.length === 0 || livePlayers.length === 1) {
        livePlayers.forEach(player => player.hand = player._private.hand);
        const bestcard = livePlayers.map(player => player.hand[0]).sort()[livePlayers.length-1];
        const playersWithBestCard = livePlayers.filter(player => player.hand[0] === bestcard);
        if (playersWithBestCard.length === 1) {
            playersWithBestCard[0].score++;
            game.winners = [playersWithBestCard[0].id];
        } else {
            const bestdiscard = playersWithBestCard.map(player => player.discards.reduce((total, i) => total + i, 0)).sort()[playersWithBestCard.length-1];
            const playersWithBestDiscard = playersWithBestCard.filter(player => player.discards.reduce((total, i) => total + i, 0) === bestdiscard);
            playersWithBestDiscard.forEach(player => player.score++);
            game.winners = playersWithBestDiscard.map(player => player.id);
        }

        // check for game over
        const winners = game._players.filter(player => player.score >= scoreNeededToWinByPlayerCount[game._players.length]);
        if (winners.length) {
            game.winners = winners.map(player => player.id);
            game.mode = 'gameover';
        } else {
            game.mode = 'round';
        }
    }

    // next player
    do {
        game.turn = thisPlayer.playerToLeft;
        thisPlayer = livePlayers.filter(player => player.id === game.turn)[0];
    } while (!thisPlayer);

    thisPlayer.protected = false;
    thisPlayer._private.hand.push(game._hidden.deck.pop());
};

module.exports.round = function(ready, game){
    forPlayer(ready.user.id, player => {
        player.ready = true;
    }, game);

    if (game._players.every(player => player.ready)) {
        forPlayer(game.winners[getRandomInt(game.winners.length-1)],
            player => game.turn = player.id,
            game);
        doNewRound(game);
    }
};