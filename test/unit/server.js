/*import tape from 'tape';
import _ from 'lodash';
import { getRandomInt } from '../../../game/common/MathUtil';
import * as trixit from '../../../game/trixit/server';*/

const tape = require('tape');
const _ = require('lodash');
const trixit = require('../../../game/trixit/server');

function getRandomInt(max) {
    return Math.floor(Math.random() * (Math.floor(max) + 1));
}

function getNewGame(numberOfPlayers) {
    const game = {
        id: '1',
        game: 'trixit',
        players: [],
        name: 'test',
        _hidden: {},
        _players: []
    };

    game.players = _.times(numberOfPlayers, i => 'id' + i);
    game._players = _.times(numberOfPlayers, i => ({
        id: 'id' + i,
        _hidden: {},
        _private: {}
    }));

    return game;
}

tape('setup', t => {
    t.plan(((8 + 7 + 6 + 5 + 4 + 3) * 4) + (6 * 5)); // first part is all the player combos, second part is the general game combos multiplied by the number of players combos

    _.times(6, i => {
        const numberOfPlayers = i + 3;
        const game = getNewGame(numberOfPlayers);
        trixit.setup(game);
        t.equal(game._hidden.deck.length, 450 - (6 * numberOfPlayers));
        t.ok(game.storyteller);
        t.equal(game._players.filter(p => p.id === game.storyteller).length, 1);
        t.equal(game.mode, 'story');

        const sample = _.concat(game._hidden.deck, _.flatten(game._players.map(p => p._private.hand)));
        t.equal(sample.length, _.uniq(sample).length);

        _.times(numberOfPlayers, j => {
            t.equal(game._players[j].score, 0);
            t.ok(game._players[j].playerToLeft);
            t.notEqual(game._players[j].playerToLeft, game._players[j].id);
            t.equal(game._players[j]._private.hand.length, 6);
        })
    });
});

tape('do a game', t => {
    _.times(6, i => {
        const numberOfPlayers = i + 3;

        const game = getNewGame(numberOfPlayers);

        // setup
        trixit.setup(game);
        t.equal(game.mode, 'story');

        let storyteller, voters, count;
        while (game.mode !== 'gameover') {
            storyteller = game._players.filter(p => p.id === game.storyteller)[0];
            voters = game._players.filter(p => p.id !== game.storyteller);

            // story
            trixit[game.mode]({ user: storyteller, story: 'mystory', card: storyteller._private.hand[getRandomInt(5)] }, game);
            t.equal(storyteller._private.hand.length, 5);
            t.equal(game.story, 'mystory');
            t.ok(game._hidden.storycard);
            t.equal(game.mode, 'suggestion');

            // suggestion
            voters.forEach((voter, i)=> {
                trixit[game.mode]({ user: voter, card: voter._private.hand[getRandomInt(5)] }, game);
                if (i === voters.length - 1) {
                    t.equal(game.mode, 'voting');
                } else {
                    t.equal(game.mode, 'suggestion');
                }
            });
            t.equal(game.board.length, numberOfPlayers);
            count = game._hidden.deck.length;

            // voting
            voters.forEach((voter, i) => {
                trixit[game.mode]({ user: voter, card: game.board[getRandomInt(numberOfPlayers - 1)] }, game);
                if (i !== voters.length - 1) {
                    t.equal(game.mode, 'voting');
                }
            });

            if (game.mode !== 'gameover') {
                // next
                game._players.forEach((player, i) => {
                    trixit[game.mode]({ user: player }, game);
                    if (i !== game._players.length - 1) {
                        t.equal(game.mode, 'next');
                    }
                });
                t.equal(game._hidden.deck.length, count - numberOfPlayers);
            }
        }
    });
    t.end();
});
