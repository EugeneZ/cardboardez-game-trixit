const _ = require('lodash');

function forPlayer(id, cb, { _players }) {
    for (let i = 0; i < _players.length; i++) {
        if (_players[i].id === id) {
            cb(_players[i]);
            break;
        }
    }
}

module.exports.setup = function (game) {
    game._hidden.deck = _.shuffle(game.options.images);
    delete game.options.images; // we don't want to send this to players every time...
    game.storyteller = game.players[_.random(game.players.length - 1)];
    game._players.forEach((player, i, players) => {
        player.score = 0;
        player.playerToLeft = players[i === players.length - 1 ? 0 : i + 1].id;
        player._private.hand = _.times(6, () => game._hidden.deck.pop());
    });
    game.mode = 'story';
};

module.exports.story = function (storyAndCard, game) {
    if (storyAndCard.user.id !== game.storyteller) {
        throw new Error('Cheating (or bug?) detected for ' + storyAndCard.user.id);
    }
    forPlayer(game.storyteller, player => {
        player._private.hand = _.pull(player._private.hand, storyAndCard.card);
        player._private.suggestion = storyAndCard.card;
    }, game);
    game._hidden.storycard = storyAndCard.card;
    game.story = storyAndCard.story;
    game.mode = 'suggestion';
};

module.exports.suggestion = function (suggestion, game) {
    if (suggestion.user.id === game.storyteller) {
        throw new Error('Cheating (or bug?) detected for ' + suggestion.user.id);
    }

    forPlayer(suggestion.user.id, player => {
        if (player._private.suggestion) {
            return;
        }
        player._private.suggestion = suggestion.card;
        player._private.hand = _.pull(player._private.hand, suggestion.card);
        player.ready = true;
    }, game);

    if (game._players.every(player => player.ready || player.id === game.storyteller)) {
        game._players.forEach(player => player.ready = false);
        game.board = _.shuffle(game._players.map(player => player._private.suggestion)); // we placed the storycard as the storyteller's suggestion so this works
        game.mode = 'voting';
    }
};

module.exports.voting = function (vote, game) {
    if (vote.user.id === game.storyteller) {
        throw new Error('Cheating (or bug?) detected for ' + vote.user.id);
    }

    forPlayer(vote.user.id, player => {
        player._private.vote = vote.card;
        player.ready = true;
    }, game);

    if (game._players.every(player => player.ready || player.id === game.storyteller)) {

        game._players.forEach(player => player.ready = false);

        // Reveal votes and card owners
        game._players.forEach(player => {
            if (player.id === game.storyteller) {
                player.suggestion = game._hidden.storycard;
            } else {
                player.suggestion = player._private.suggestion;
                player.vote = player._private.vote;
            }
        });

        // Calculate score
        const storyteller = game._players.find(player => player.id === game.storyteller);
        const voters = game._players.filter(player => player.id !== game.storyteller);
        const votes = voters.map(player => player.vote);
        const matchingVotes = votes.filter(vote => vote === game._hidden.storycard);

        if (matchingVotes.length === 0 || matchingVotes.length === voters.length) {
            voters.forEach(voter => voter.score += 2);
        } else {
            storyteller.score += 3;
            voters.forEach(voter => {
                if (voter.vote === game._hidden.storycard) {
                    voter.score += 3;
                }
            });
        }

        votes.forEach(vote => {
            if (vote !== game._hidden.storycard) {
                voters.forEach(voter => {
                    if (voter.suggestion === vote) {
                        voter.score += 1;
                    }
                });
            }
        });

        // Check for game over
        if (game._hidden.deck.length < game._players.length) {
            game.mode = 'gameover';
        } else if (game._players.some(player => player.score >= 30)) {
            game.mode = 'gameover';
        } else {
            game.mode = 'next';
        }

        if (game.mode === 'gameover') {
            const highscore = _.max(game._players.map(p => p.score));
            game.winners = game._players.filter(p => p.score === highscore).map(p => p.id);
        }
    }
};

module.exports.next = function (ready, game) {
    forPlayer(ready.user.id, player => {
        player.ready = true;
    }, game);

    if (game._players.every(player => player.ready)) {

        game._players.forEach(player => {
            player._private.hand.push(game._hidden.deck.pop());
            player.ready = false;
            player.vote = null;
            player.suggestion = null;
            player._private.vote = null;
            player._private.suggestion = null;
        });

        game._hidden.storycard = null;
        game.board = null;
        game.story = null;

        game.storyteller = game._players.find(player => player.id === game.storyteller).playerToLeft;

        game.mode = 'story';
    }
};