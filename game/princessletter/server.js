const _ = require('lodash');
const scoreNeededToWinByPlayerCount = require('./scoreNeededToWinByPlayerCount');
const cardNames = require('./cardNames');

function forPlayer(id, cb, { _players }) {
    for (let i = 0; i < _players.length; i++) {
        if (_players[i].id === id) {
            cb(_players[i]);
            break;
        }
    }
}

function discardCard(player, card) {
    player.discards.push(
        player._private.hand.splice(player._private.hand.indexOf(card), 1)[0]
    );
    player.discardtotal += player.discards[player.discards.length - 1];
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
        player.discardtotal = 0;
        player._private.hand.push(game._hidden.deck.pop());
    });

    game.mode = 'turn';
}

module.exports.setup = function(game){
    game.log = [];
    game.turn = game.players[_.random(game.players.length-1)];
    game.winners = null;
    game._players.forEach((player, i, players) => {
        player.score = 0;
        player._private.hand = [];
        player.playerToLeft = players[i === players.length - 1 ? 0 : i + 1].id;
    });
    doNewRound(game);
};

module.exports.turn = function(turn, game){
    if (turn.user.id !== game.turn || !turn.card) {
        throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
    }

    let livePlayers = game._players.filter(player => !player.dead);
    const targetablePlayers = livePlayers.filter(player => !player.protected);
    let thisPlayer = livePlayers.find(player => player.id === turn.user.id);
    thisPlayer.guess = null;
    thisPlayer.protected = false;

    // card effect
    const target = targetablePlayers.find(player => player.id === turn.target);
    let discarded = false;

    if (turn.card === 1) {
        if ((!target && targetablePlayers.length) || turn.guess === 1){
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (targetablePlayers.length) {
            thisPlayer.guess = turn.guess;
            if (target._private.hand[0] === thisPlayer.guess) {
                target.dead = true;
                discardCard(target, thisPlayer.guess);
                game.log(`{0} played a Guard and guessed that {1} was a ${cardNames[thisPlayer.guess]} and was CORRECT!`);
            } else {
                game.log(`{0} played a Guard and guessed that {1} was a ${cardNames[thisPlayer.guess]} but was incorrect.`);
            }
        } else {
            game.log(`{0} played a Guard but there were no legal targets so it was discarded without effect.`);
        }
    } else if (turn.card === 2) {
        if (!target && targetablePlayers.length) {
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (target !== thisPlayer) {
            thisPlayer.peek = target._private.hand[0];
            game.log(`{0} played a Priest to peek at {1}'s card.`);
        } else {
            game.log(`{0} played a Priest but there were no legal targets so it was discarded without effect.`);
        }
    } else if (turn.card === 3) {
        if ((!target && targetablePlayers.length) || (target && target === thisPlayer) || (target && !targetablePlayers.includes(target))) {
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (target) {
            discardCard(thisPlayer, turn.card);
            discarded = true;
            if (thisPlayer._private.hand[0] > target._private.hand[0]) {
                target.dead = true;
                discardCard(target, thisPlayer.guess);
            } else if (thisPlayer._private.hand[0] > target._private.hand[0]) {
                thisPlayer.dead = true;
                discardCard(thisPlayer, thisPlayer._private.hand[0]);
            }
        }
    } else if (turn.card === 4) {
        thisPlayer.protected = true;
    } else if (turn.card === 5) {
        if (!target || thisPlayer._private.hand.includes(7)){
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (game._hidden.deck.length) {
            target._private.hand = [game._hidden.deck.pop()];
        } else {
            target._private.hand = [game._hidden.hidden];
        }
    } else if (turn.card === 6) {
        if ((!target && targetablePlayers.length) || thisPlayer._private.hand.includes(7)) {
            throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
        } else if (target !== thisPlayer) {
            discardCard(thisPlayer, turn.card);
            discarded = true;
            const temp = target._private.hand;
            target._private.hand = thisPlayer._private.hand;
            thisPlayer._private.hand = temp;
        }
    }  else if (turn.card === 8) {
        throw new Error('Cheating (or bug?) detected for ' + turn.user.id);
    }// countess doesn't need anything special

    thisPlayer.target = target && target.id;
    game.target = target && target.id;
    game.lastPlayed = turn.card;

    if (!discarded) {
        discardCard(thisPlayer, turn.card);
    }

    // check for round end
    livePlayers = game._players.filter(player => !player.dead);
    if (livePlayers.length === 1) {
        livePlayers[0].score++;
        game.winners = livePlayers[0].id;
    } else if (game._hidden.deck.length === 0) {
        livePlayers.forEach(player => player.hand = player._private.hand);
        const bestcard = _.max(livePlayers.map(player => player.hand[0]));
        const playersWithBestCard = livePlayers.filter(player => player.hand[0] === bestcard);
        if (playersWithBestCard.length === 1) {
            playersWithBestCard[0].score++;
            game.winners = [playersWithBestCard[0].id];
        } else {
            const bestdiscard = _.max(playersWithBestCard.map(player => player.discardtotal));
            const playersWithBestDiscard = playersWithBestCard.filter(player => player.discardtotal === bestdiscard);
            playersWithBestDiscard.forEach(player => player.score++);
            game.winners = playersWithBestDiscard.map(player => player.id);
        }
    }

    // check for game over, or start a new round
    if (game._hidden.deck.length === 0 || livePlayers.length === 1) {
        const winners = game._players.filter(player => player.score >= scoreNeededToWinByPlayerCount[game._players.length]);
        if (winners.length) {
            game.winners = winners.map(player => player.id);
            game.mode = 'gameover';
        } else {
            game.mode = 'round';
        }
        return;
    }

    // otherwise, go to next player
    do {
        game.turn = thisPlayer.playerToLeft;
        thisPlayer = livePlayers.find(player => player.id === game.turn);
    } while (!thisPlayer);

    thisPlayer.protected = false;
    thisPlayer._private.hand.push(game._hidden.deck.pop());
};

module.exports.round = function(ready, game){
    forPlayer(ready.user.id, player => {
        player.ready = true;
    }, game);

    if (game._players.every(player => player.ready)) {
        forPlayer(game.winners[_.random(game.winners.length-1)],
            player => game.turn = player.id,
            game);
        doNewRound(game);
    }
};