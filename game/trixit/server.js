const _ = require('lodash');
const Deck = require('../common/Deck');
const MathUtil = require('../common/MathUtil');

function playerIsStoryteller(player, [ignore, game, players]) {
    return players.a[game.open('storyteller')].id === player.id;
}

module.exports.setup = function(game, players){
    game.deck('deck', new Deck(450));
    game.open('storyteller', MathUtil.getRandomInt(players.a.length-1));
    players.a.forEach(player => {
        const hand = _.times(6, () => game.deck('deck').draw());
        player.hand('hand', hand);
    });
    game.mode('story');
};

module.exports.story = function(storyAndCard, game, players){
    if (!playerIsStoryteller(storyAndCard.user, arguments)) {
        return console.warn('Cheating (or bug?) detected', storyAndCard.user.id);
    }
    game.hidden('storycard', storyAndCard.card);
    game.open('story', storyAndCard.story);
    game.mode('suggestion');
};

module.exports.suggestion = function(suggestion, game, players){
    if (playerIsStoryteller(suggestion.user, arguments)) {
        return console.warn('Cheating (or bug?) detected', suggestion.user.id);
    }

    players.forPlayer(suggestion.user.id, player => {
        player.hidden('suggestion', suggestion.card);
    });

    if (_.every(players.a, player => typeof player.hidden('suggestion') === 'number' || playerIsStoryteller(player, arguments))){
        const suggestions = _.shuffle(players.a.map(player => player.hidden('suggestion')));
        game.open('cards', suggestions);
        game.mode('voting');
    }
};

module.exports.voting = function(vote, game, players) {
    if (playerIsStoryteller(vote.user, arguments)) {
        return console.warn('Cheating (or bug?) detected', vote.user.id);
    }

    players.forPlayer(vote.user.id, player => {
        player.hidden('vote', vote.card);
    });

    if (_.every(players.a, player => typeof player.hidden('vote') === 'number' || playerIsStoryteller(player, arguments))){

        // Reveal votes and card owners
        players.a.forEach(player => {
            if (playerIsStoryteller(player, arguments)) {
                player.open('suggestion', game.hidden('storycard'));
            } else {
                player.open('suggestion', player.hidden('suggestion'));
                player.open('vote', player.hidden('vote'));
            }
        });

        // Calculate score
        const storyteller = players.a.filter(player => playerIsStoryteller(player, arguments))[0];
        const voters = players.a.filter(player => !playerIsStoryteller(player, arguments));
        const votes = voters.map(player => player.hidden('vote'));
        const matchingVotes = votes.filter(vote => vote === game.hidden('storycard'));

        if (matchingVotes.length === 0 || matchingVotes.length === voters.length){
            voters.forEach(voter => voter.score += 2);
        } else {
            storyteller.score += 3;
            voters.forEach(voter => {
                if (voter.hidden('vote') === game.hidden('storycard')) {
                    voter.score += 3;
                }
            })
        }

        votes.forEach(vote => {
            if (vote !== game.hidden('storycard')) {
                voters.forEach(voter => {
                    if (voter.hidden('suggestion') === vote) {
                        voter.score += 1;
                    }
                })
            }
        });

        // Check for game over
        if (game.deck('deck').count() < players.a.length) {
            game.mode('gameover');
        } else {
            game.mode('next');
        }
    }
};

module.exports.next = function(ready, game, players){
    players.forPlayer(ready.user.id, player => {
        player.open('ready', true);
    });

    if (_.every(players.a, player => typeof player.open('ready'))) {

        players.a.forEach((player, i) => {
            player
                .hand('hand', player.hand('hand').push(game.deck('deck').draw()))
                .open('ready', false)
                .open('vote', null)
                .hidden('vote', null)
                .open('suggestion', null)
                .hidden('suggestion', null)
                .hidden('story');
        });

        game.hidden('storycard', null);
        game.open('cards', null);
        game.open('story', null);

        if (game.open('storyteller') >= players.a.length) {
            game.open('storyteller', 0);
        } else {
            game.open('storyteller', game.open('storyteller') + 1);
        }

        game.mode('story');
    }
};