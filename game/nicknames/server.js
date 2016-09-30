const _ = require('lodash');
const MathUtil = require('../common/MathUtil');
const words = require('./words');

module.exports.setup = function (game) {
    game.redwordsleft = 8;
    game.bluewordsleft = 8;
    game.guesses = 0;
    game._hidden.words = {};
    game.revealed = {};
    game.board = [];
    while (game.board.length < 25) {
        const word = words[MathUtil.getRandomInt(399)];
        if (game.board.indexOf(word) === -1) {
            game.board.push(word);
            game._hidden.words[word] = 'neutral';
        }
    }
    game._hidden.red = [];
    game._hidden.blue = [];

    let used = [];
    const getUnusedWord = ()=> {
        let word;
        while (!word || used.indexOf(word) !== -1) {
            word = game.board[MathUtil.getRandomInt(24)];
        }
        used.push(word);
        return word;
    };

    ['red', 'blue'].forEach(color =>
        _.times(8, () => {
            let word = getUnusedWord();
            game._hidden[color].push(word);
            game._hidden.words[word] = color;
        })
    );

    let lastword = getUnusedWord();
    if (MathUtil.getRandomInt(1)) {
        game._hidden.red.push(lastword);
        game._hidden.words[lastword] = 'red';
        game.redturn = true;
        game.redwordsleft++;
    } else {
        game._hidden.blue.push(lastword);
        game._hidden.words[lastword] = 'blue';
        game.blueturn = false;
        game.bluewordsleft++;
    }

    game._hidden.assassin = getUnusedWord();
    game._hidden.words[game._hidden.assassin] = 'assassin';

    game._players.forEach((player, i) => {
        if (i === 0) {
            player.redleader = true;
            player._private.words = game._hidden;
            game.redleader = player.id;
        } else if (i === 1) {
            player.blueleader = true;
            player._private.words = game._hidden;
            game.blueleader = player.id;
        } else if (i === game._players.length - 1 && game._players.length % 2 !== 0) {
            MathUtil.getRandomInt(1) ? player.red = true : player.blue = true;
        } else {
            i % 2 ? player.blue = true : player.red = true;
        }
    });

    game.mode = 'clue';
};

module.exports.clue = function (clue, game) {
    if ((game.redturn && clue.user.id !== game.redleader) || (!game.redturn && clue.user.id !== game.blueleader)) {
        throw new Error('Cheating (or bug?) detected for ' + clue.user.id);
    }

    game.guesses = 0;
    game.rejectedClue = false;
    game._hidden.clue = clue.clue;

    clue.clue.split(' ').forEach(piece => {
        let number = parseInt(piece, 10);
        if (number) {
            game.maxguesses = number;
        }
    });

    game._players
        .filter(player => player.redleader || player.blueleader)
        .forEach(player => player._private.clue = clue.clue);

    game.mode = 'verify'
};

module.exports.verify = function (verify, game) {
    if ((!game.redturn && verify.user.id !== game.redleader) || (game.redturn && verify.user.id !== game.blueleader)) {
        throw new Error('Cheating (or bug?) detected for ' + verify.user.id);
    }

    if (verify.verified) {
        game.clue = game._hidden.clue;
        game.mode = 'guess';
    } else {
        game.rejectedClue = true;
        game.mode = 'clue';
    }
};

module.exports.guess = function (guess, game) {
    if (guess.user.id === game.redleader || guess.user.id === game.blueleader || game.board.indexOf(guess.word) === -1 || game.revealed[guess.word]) { // TODO: Add check that other teams' members aren't guessing
        throw new Error('Cheating (or bug?) detected for ' + guess.user.id);
    }

    if (guess.pass && game.guesses > 0) {
        game.redturn = !game.redturn;
        game.mode = 'clue';
        return;
    }

    if (guess.word === game._hidden.assassin) {
        game.revealed = game._hidden.words;
        game.assassinated = true;
        game.mode = 'gameover';
        return;
    }

    let endturn = false;

    if (game._hidden.words[guess.word] === 'neutral') {
        endturn = true;
    } else if (game.redturn && game._hidden.words[guess.word] === 'red') { // correct!
        game.guesses++;
        game.redwordsleft--;
    } else if (!game.redturn && game._hidden.words[guess.word] === 'blue') { // correct!
        game.guesses++;
        game.bluewordsleft--;
    } else { // incorrect :(
        endturn = true;
    }

    if (game.maxguesses && game.guesses >= game.maxguesses) {
        endturn = true;
    }

    game.revealed[guess.word] = game._hidden.words[guess.word];

    // check for end game
    if (!game.redwordsleft || !game.bluewordsleft) {
        game.mode = 'gameover';
        return;
    }

    if (endturn) {
        game.redturn = !game.redturn;
        game.mode = 'clue';
    }
};