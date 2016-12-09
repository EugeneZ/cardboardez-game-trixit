/*import tape from 'tape';
 import _ from 'lodash';
 import { getRandomInt } from '../../../game/common/MathUtil';
 import * as trixit from '../../../game/trixit/server';*/

const tape = require('tape');
const _ = require('lodash');
const summit = require('../../../game/summit/server');

function getRandomInt(max) {
    return Math.floor(Math.random() * (Math.floor(max) + 1));
}

function getNewGame(villagers, werewolves, roles) {
    const game = {
        id: '1',
        game: 'summit',
        players: [],
        name: 'test',
        _hidden: {},
        _players: [],
        options: {
            villagers,
            werewolves,
            ...roles
        }
    };

    game.players = _.times(villagers + werewolves + Object.keys(game.options).length - 5, i => 'id' + i);
    game._players = _.times(villagers + werewolves + Object.keys(game.options).length - 5, i => ({
        id: 'id' + i,
        _hidden: {},
        _private: {}
    }));

    return game;
}

tape('setup', t => {
    const roles = {
        alphaWolf: true,
        troublemaker: true
    };
    const game = getNewGame(4, 1, roles);
    summit.setup(game);

    t.equals(game._hidden.center.length, roles.alphaWolf ? 4 : 3);
    t.ok(game.order.length);
    t.equals(game.order[game.order.length - 1], 'day');

    t.equals(game.mode, 'alphaWolf');
    summit.alphaWolf({ target: 'id2', user: { id: 'id0' }}, game);
    t.equals(game.mode, 'alphaWolf');
    summit.alphaWolf({ target: 'id2', user: { id: 'id1' }}, game);
    t.equals(game.mode, 'alphaWolf');
    summit.alphaWolf({ target: 'id3', user: { id: 'id2' }}, game);
    t.equals(game.mode, 'alphaWolf');
    summit.alphaWolf({ target: 'id2', user: { id: 'id3' }}, game);

    t.equals(game.mode, 'troublemaker');
    summit.troublemaker({ target1: 'id1', target2: 'id2', user: { id: 'id0' }}, game);
    t.equals(game.mode, 'troublemaker');
    summit.troublemaker({ target1: 'id0', target2: 'id2', user: { id: 'id1' }}, game);
    t.equals(game.mode, 'troublemaker');
    summit.troublemaker({ target1: 'id1', target2: 'id3', user: { id: 'id2' }}, game);
    t.equals(game.mode, 'troublemaker');
    summit.troublemaker({ target1: 'id1', target2: 'id2', user: { id: 'id3' }}, game);

    t.equals(game.mode, 'day');

    summit.day({ target: 'id1', user: { id: 'id0' }}, game);
    t.equals(game.mode, 'day');
    summit.day({ target: 'id0', user: { id: 'id1' }}, game);
    t.equals(game.mode, 'day');
    summit.day({ target: 'id1', user: { id: 'id2' }}, game);
    t.equals(game.mode, 'day');
    summit.day({ target: 'id1', user: { id: 'id3' }}, game);
    t.equals(game.mode, 'gameover');



    console.log(game);
    console.log(game._players);
    t.end();
});

tape.skip('do a game', t => {
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