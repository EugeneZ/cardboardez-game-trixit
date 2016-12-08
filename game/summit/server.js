const _ = require('lodash');
const roles = require('./roles');
const moment = require('moment');

const CENTER_LEFT = 0,
    CENTER_MIDDLE = 1,
    CENTER_RIGHT = 2,
    CENTER_WEREWOLF = 3;

const WEREWOLF_ROLES_THAT_ARE_KNOWN = ['werewolf', 'alphaWolf', 'mysticWolf', 'dreamWolf'];
const SEER_ROLES = ['seer', 'apprenticeSeer'];
const ARTIFACTS = ['werewolf', 'villager', 'tanner', 'void', 'mute', 'shroud'];

const doAction = function (game, action) {
    if (!(this instanceof doAction)) {
        return new doAction(game, action);
    }

    const getPlayer = idOrPlayer => {
        return typeof idOrPlayer === 'string' ? game._players.find(p => p.id === idOrPlayer) : idOrPlayer;
    };

    const tasks = [],
        players = [],
        centers = [];

    let mainPlayer = getPlayer(action.user.id),
        peekedOrMovedCards = false;

    this.mainPlayer = idOrPlayer => {
        mainPlayer = getPlayer(idOrPlayer);
        return this;
    };

    this.player = idOrPlayer => {
        players.push(getPlayer(idOrPlayer));
        return this;
    };

    this.center = index => {
        centers.push(index);
        return this;
    };

    this.swap = () => {
        peekedOrMovedCards = true;

        tasks.push(() => {
            if (players.length > 1) {
                let next, last = players[players.length - 1]._hidden.role;
                players.filter(p => !p.shield).forEach(player => {
                    next = player._hidden.role;
                    player._hidden.role = last;
                    last = next;
                });
            } else if (players.length === 1 && centers.length === 1 && !players[0].shield) {
                let temp = centers[0];
                centers[0] = players[0]._hidden.role;
                players[0]._hidden.role = temp;
            }
        });

        return this;
    };

    this.peek = cb => {
        peekedOrMovedCards = true;

        tasks.push(
            () => {
                let peekedAt;

                players.filter(p => !p.shield).forEach(
                    player => mainPlayer._private.peeked[player.id] = peekedAt = player._hidden.role
                );

                centers.forEach(
                    center => mainPlayer._private.peeked[center.toString()] = peekedAt = game._hidden.center[center]
                );

                if (typeof cb === 'function') {
                    cb(mainPlayer, peekedAt);
                }
            }
        );

        return this;
    };

    this.attributes = attributes => {
        tasks.push(() => players.forEach(player => _.merge(player, attributes)));
        return this;
    };

    this.reversePlayers = () => {
        tasks.push(() => players.reverse());
        return this;
    };

    this.do = () => {
        if (peekedOrMovedCards) {
            mainPlayer._private.peekedOrMovedCards = true;
        }
        tasks.forEach(task => task());
        return this;
    };

    return this;
};

function throwFatalError(action) {
    throw new Error(`Cheating (or bug?) detected for player ${action.user.id}`);
}

function forPlayer(id, cb, { _players }) {
    for (let i = 0; i < _players.length; i++) {
        if (_players[i].id === id) {
            cb(_players[i]);
            break;
        }
    }
}

function playerThinksTheyAre(player, roleOrRoles) {
    const roles = [].concat(roleOrRoles);
    return roles.includes(player._private.role) || (player._private.role === 'doppleganger' && roleOrRoles.includes(player._private.doppleganger));
}

function playerActuallyIs(player, roleOrRoles, game) {
    const roles = [].concat(roleOrRoles);
    return roles.includes(player._hidden.role) || (player._hidden.role === 'doppleganger' && roleOrRoles.includes(game._hidden.doppleganger));
}

function setKnows(players) {
    const werewolfRolesThatSeeKnowns = ['werewolf', 'alphaWolf', 'mysticWolf', 'minion', 'squire'];
    const masonRoles = ['mason', 'mason1', 'mason2'];

    const knownWolves = players
        .filter(player => playerThinksTheyAre(player, WEREWOLF_ROLES_THAT_ARE_KNOWN))
        .map(player => player.id);

    const knownMasons = players
        .filter(player => playerThinksTheyAre(player, masonRoles))
        .map(player => player.id);

    const knownSeers = players
        .filter(player => playerThinksTheyAre(player, SEER_ROLES))
        .map(player => player.id);

    players.forEach(player => {
        if (playerThinksTheyAre(player, werewolfRolesThatSeeKnowns)) {
            player._private.knows = player._private.knows.concat(knownWolves);
        }

        if (playerThinksTheyAre(player, 'apprenticeTanner')) {
            const tanner = players.filter(p => playerThinksTheyAre(p, 'tanner'));
            if (tanner) {
                player._private.knows.push(tanner.id);
            }
        }

        if (playerThinksTheyAre(player, ['mason', 'mason1', 'mason2'])) {
            player._private.knows = player._private.knows.concat(knownMasons);
        }

        if (playerThinksTheyAre(player, 'beholder')) {
            player._private.knows = player._private.knows.concat(knownSeers);
        }
    });

    // players' own ids shouldn't be in the knowns if they somehow ended up there.
    players.forEach(player => player._private.knows = player._private.knows.filter(id => player.id !== id));
}

module.exports.setup = function (game) {

    // Determine roles
    const selectedRoles = roles.reduce((cur, role) => {
        if (game.options[role]) {
            return cur.concat(role.name);
        }
        return cur;
    }, [].concat(_.times(game.options.villagers, 'villager'), _.times(game.options.werewolves, 'werewolf')));

    // Assign cards
    game._hidden.center = _.shuffle(selectedRoles); // all cards start in the center, we will hand them out soon

    game._players.forEach(player => {
        player.votes = 0;
        player._private.peeked = {};
        player._private.knows = [];
        player._hidden.role = player._private.role = game._hidden.center.pop();
    });

    if (selectedRoles.includes('alphaWolf')) {
        game._hidden.center.push('werewolf');
    }

    // Determine night actions
    // We use the "wake" flag on roles, but this can be misleading -- many roles that have no flag actually do wake
    // but we only mark roles as "wake" if they need to perform some actions. So for example regular werewolves don't
    // "wake" in our version because we provide them with the identities of the other werewolves without any action
    // taken by them.
    const order = selectedRoles
        .map(role => roles.find(r => r.name === role) || { wake: false })
        .filter(role => typeof role.wake === 'number')
        .sort((a, b) => a.wake - b.wake)
        .map(role => role.name);

    if (selectedRoles.includes('doppleganger')) {

        // if there's a doppleganger, we need to add doppleganger actions to the order based on what's in the game
        // First the immediate doppleganger actions
        ['alphaWolf', 'mysticWolf', 'sentinel', 'thing', 'seer', 'apprenticeSeer', 'paranormalInvestigator', 'robber',
            'witch', 'troublemaker', 'villageIdiot', 'drunk'].forEach(role => {
            if (selectedRoles.includes(role)) {
                order.splice(order.indexOf('doppleganger') + 1, 0, 'doppleganger' + role);
            }
        });

        // Then the actions that go after their doppleganged role
        ['auraSeer', 'insomniac', 'squire', 'beholder', 'revealer', 'curator'].forEach(role => {
            if (selectedRoles.includes(role)) {
                order.splice(order.indexOf(role) + 1, 0, 'doppleganger' + role);
            }
        });

    } else {
        // if there's no doppleganger, tell people who they "know" (werewolves, etc). If there's a doppleganger we'll do
        // this after they go.
        setKnows(game._players);
    }
    game.order = _.uniq(order);
    game.order.push('day');
    game.mode = game.order[0];

    // Determine timing
    game.starts = moment().unix();
    game.minutes = parseInt(game.options.timer, 10) || 5;
    game.ends = moment().add(game.minutes, 'minutes').add(5, 'seconds').unix(); //adding five seconds for lag or w/e
};

module.exports.day = function (vote, game) {
    if (moment().unix() < game.ends) {
        forPlayer(vote.user.id, player => {
            if (player.vote) {
                forPlayer(player.vote, target => {
                    target.votes--;
                    target._hidden.guarded = false;
                }, game);
            }
            player.vote = vote.target;
            if (player.vote) {
                forPlayer(player.vote, target => {
                    target.votes++;
                    if (playerActuallyIs(player, 'bodyguard', game)) {
                        target._hidden.guarded = true;
                    }
                }, game);
            }
        }, game);
    }

    if (game._players.every(p => p.vote) || moment().unix() < game.ends) {

        game.doppleganger = game._hidden.doppleganger;

        // figure out who died
        const deadPlayers = game._players
            .filter(player => !player.guarded)
            .filter(player => !playerActuallyIs(player, 'prince', game))
            .sort((a, b) => b.votes - a.votes)
            .filter((player, i, sorted) => player.votes === sorted[0].votes);

        game._players.forEach(player => {
            _.merge(player, player._private, player._hidden);

            if (player.vote && playerActuallyIs(player, 'hunter', game)) {
                deadPlayers.push(game._players.find(target => target.id === player.vote && !target.guarded));
            }
        });

        game.deadPlayers = _.uniq(deadPlayers.filter(p => p));

        // figure out who won
        game.winners = [];

        // Tanners? Or PIs/dopples who are now tanners?
        game._players.forEach(player => {
            if (playerActuallyIs(player, ['tanner', 'apprenticeTanner'], game) && deadPlayers.includes(player)) {
                game.winners.push(player.id);
            }
        });

        // If any tanners won, no one else can win
        if (!game.winners.length) {
            const werewolvesInPlay = game._players
                .filter(player => playerActuallyIs(player, ['werewolf', 'alphaWolf', 'mysticWolf', 'dreamWolf'], game));
            const minionSquiresInPlay = game._players
                .filter(player => playerActuallyIs(player, ['minion', 'squire'], game));
            const evilTeamInPlay = game._players
                .filter(player => playerActuallyIs(player, ['werewolf', 'alphaWolf', 'mysticWolf', 'dreamWolf', 'minion', 'squire'], game));
            const goodTeamInPlay = game._players
                .filter(player => !playerActuallyIs(player, ['werewolf', 'alphaWolf', 'mysticWolf', 'dreamWolf', 'minion', 'squire', 'tanner', 'apprenticeTanner'], game));

            if (werewolvesInPlay.length) {

                if (werewolvesInPlay.some(player => deadPlayers.includes(player))) {
                    game.winners = game.winners.concat(goodTeamInPlay.map(p=>p.id));
                } else {
                    game.winners = game.winners.concat(evilTeamInPlay.map(p=>p.id));
                }

            } else if (minionSquiresInPlay.length) {

                if (minionSquiresInPlay.some(player => deadPlayers.includes(player))) {
                    game.winners = game.winners.concat(goodTeamInPlay.map(p=>p.id));
                } else {
                    game.winners = game.winners.concat(evilTeamInPlay.map(p=>p.id));
                }

            } else if (!deadPlayers.length) {
                game.winners = game.winners.concat(goodTeamInPlay.map(p=>p.id));
            }
        }

        game.mode = 'gameover';
    }
};

module.exports.doppleganger = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .peek()
        .do();

    // Since there's a doppleganger, we need to recalculate the "knows" afterwards
    setKnows(game._players);

    game.mode = game.order[game.order.indexOf('doppleganger') + 1];
};

module.exports.dopplegangeralphaWolf = function(pick, game) {
    module.exports.alphaWolf(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangeralphaWolf') + 1];
};

module.exports.dopplegangermysticWolf = function(pick, game) {
    module.exports.mysticWolf(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangermysticWolf') + 1];
};

module.exports.dopplegangersentinel = function(pick, game) {
    module.exports.sentinel(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangersentinel') + 1];
};

module.exports.dopplegangerthing = function(pick, game) {
    module.exports.thing(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerthing') + 1];
};

module.exports.dopplegangerseer = function(pick, game) {
    module.exports.seer(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerseer') + 1];
};

module.exports.dopplegangerapprenticeSeer = function(pick, game) {
    module.exports.apprenticeSeer(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerapprenticeSeer') + 1];
};

module.exports.dopplegangerparanormalInvestigator = function(pick, game) {
    module.exports.paranormalInvestigator(pick, game);
    if (game.mode === 'paranormalInvestigator2') {
        game.mode = 'dopplegangerparanormalInvestigator2';
    } else {
        game.mode = game.order[game.order.indexOf('dopplegangerparanormalInvestigator') + 1];
    }
};

module.exports.dopplegangerparanormalInvestigator2 = function(pick, game) {
    module.exports.paranormalInvestigator2(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerparanormalInvestigator') + 1];
};

module.exports.dopplegangerrobber = function(pick, game) {
    module.exports.robber(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerrobber') + 1];
};

module.exports.dopplegangerwitch = function(pick, game) {
    module.exports.witch(pick, game);
    if (game.mode === 'witchSwaps') {
        game.mode = 'dopplegangerwitchSwaps';
    } else {
        game.mode = game.order[game.order.indexOf('dopplegangerwitch') + 1];
    }
};

module.exports.dopplegangerwitchSwaps = function(pick, game) {
    module.exports.witchSwaps(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerwitch') + 1];
};

module.exports.dopplegangertroublemaker = function(pick, game) {
    module.exports.troublemaker(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangertroublemaker') + 1];
};

module.exports.dopplegangervillageIdiot = function(pick, game) {
    module.exports.villageIdiot(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangervillageIdiot') + 1];
};

module.exports.dopplegangerdrunk = function(pick, game) {
    module.exports.drunk(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerdrunk') + 1];
};

module.exports.sentinel = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .attributes({ shield: true })
        .do();

    game.mode = game.order[game.order.indexOf('sentinel') + 1];
};

module.exports.alphaWolf = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .center(CENTER_WEREWOLF)
        .swap()
        .do();

    game.mode = game.order[game.order.indexOf('alphaWolf') + 1];
};

module.exports.mysticWolf = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .peek()
        .do();

    game.mode = game.order[game.order.indexOf('mysticWolf') + 1];
};

module.exports.thing = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    let currentPlayerIndex = _.findIndex(game._players, player => pick.user.id === player.id);
    let pickedPlayerIndex = _.findIndex(game._players, player => pick.user.id === pick.target);

    if (pickedPlayerIndex !== currentPlayerIndex - 1 || pickedPlayerIndex !== currentPlayerIndex + 1 ||
        (currentPlayerIndex === 0 && pickedPlayerIndex !== game._players.length - 1) ||
        (currentPlayerIndex === game._players.length - 1 && pickedPlayerIndex !== 0)) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .attributes({ _private: { tapped: true } })
        .do();

    game.mode = game.order[game.order.indexOf('thing') + 1];
};

module.exports.seer = function (pick, game) {
    if ((!pick.target && (!pick.target1 && !pick.target2)) || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    const action = doAction(game, pick);

    if (pick.target1) {
        action
            .center(pick.target1)
            .center(pick.target2);
    } else {
        action
            .player(pick.target);
    }

    action.peek().do();

    game.mode = game.order[game.order.indexOf('seer') + 1];
};

module.exports.apprenticeSeer = function (pick, game) {
    if (!pick.target) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .center(pick.target)
        .peek()
        .do();

    game.mode = game.order[game.order.indexOf('seer') + 1];
};

module.exports.paranormalInvestigator = function (pick, game) {
    if (pick.target) {
        doAction(game, pick)
            .player(pick.target)
            .peek((player, peeked) => {
                if (peeked === null) {
                    throwFatalError(pick);
                }

                if (peeked === 'werewolf') {
                    player._private.werewolf = true;
                    game._hidden.piIsWerewolf = true;
                    game.mode = game.order[game.order.indexOf('paranormalInvestigator') + 1];
                } else if (peeked === 'tanner') {
                    player._private.tanner = true;
                    game._hidden.piIsTanner = true;
                    game.mode = game.order[game.order.indexOf('paranormalInvestigator') + 1];
                } else {
                    game.mode = 'paranormalInvestigator2';
                }
            })
            .do();
    } else {
        game.mode = game.order[game.order.indexOf('paranormalInvestigator') + 1];
    }
};

module.exports.paranormalInvestigator2 = function(pick, game) {
    module.exports.paranormalInvestigator(pick, game);
    game.mode = game.order[game.order.indexOf('paranormalInvestigator') + 1];
};

module.export.robber = function (pick, game) {
    if (!pick.target) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.user.id)
        .player(pick.target)
        .swap()
        .peek()
        .do();

    game.mode = game.order[game.order.indexOf('robber') + 1];
};

module.exports.witch = function (pick, game) {
    if (pick.target) {
        doAction(game, pick)
            .center(pick.target)
            .peek()
            .do();

        game.mode = 'witchSwaps';
    } else {
        game.mode = game.order[game.order.indexOf('witch') + 1];
    }
};

module.exports.witchSwaps = function (pick, game) {
    if (!pick.target) {
        throwFatalError(pick);
    }

    let peekedAt = null;

    forPlayer(pick.user.id, player => {
        _.forOwn(player._private.peeked, (value, key) => peekedAt = key);
    }, game);

    if (peekedAt === null) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .center(peekedAt)
        .swap()
        .do();

    doAction(game, pick)
        .player(pick.target)
        .peek()
        .do();

    game.mode = game.order[game.order.indexOf('witch') + 1];
};

module.exports.troublemaker = function (pick, game) {
    if (!pick.target1 || !pick.target2 || pick.target1 === pick.target2) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target1)
        .player(pick.target2)
        .swap()
        .do();

    game.mode = game.order[game.order.indexOf('troublemaker') + 1];
};

module.exports.villageIdiot = function (pick, game) {
    if (pick.target) {
        const action = doAction(game, pick);
        game._players.forEach(player => {
            if (player.id !== pick.user.id) {
                action.player(player);
            }
        });
        if (pick.target === 'reverse') {
            action.reversePlayers();
        }

        action.swap().do();
    }

    game.mode = game.order[game.order.indexOf('villageIdiot') + 1];
};

module.exports.auraSeer = function (pick, game) {
    const auraPlayers = game._players.filter(player => player.peekedOrMovedCards);

    forPlayer(pick.user.id, player => player._hidden.knows = player._hidden.knows.concat(auraPlayers), game);

    game.mode = game.order[game.order.indexOf('auraSeer') + 1];
};

module.exports.dopplegangerauraSeer = function (pick, game) {
    module.exports.auraSeer(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerauraSeer') + 1];
};

module.exports.drunk = function (pick, game) {
    if (!pick.target || pick.target.toString().length !== 1) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.user.id)
        .center(pick.target)
        .swap()
        .do();

    game.mode = game.order[game.order.indexOf('drunk') + 1];
};

module.exports.insomniac = function (pick, game) {
    doAction(game, pick)
        .player(pick.user.id)
        .peek()
        .do();

    game.mode = game.order[game.order.indexOf('insomniac') + 1];
};

module.exports.dopplegangerinsomniac = function (pick, game) {
    module.exports.insomniac(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerinsomniac') + 1];
};

module.exports.squire = function (pick, game) {
    const action = doAction(game, pick);

    game._players
        .filter(player => playerThinksTheyAre(player, WEREWOLF_ROLES_THAT_ARE_KNOWN))
        .forEach(player => action.player(player));

    action.peek().do();

    game.mode = game.order[game.order.indexOf('squire') + 1];
};

module.exports.dopplegangersquire = function (pick, game) {
    module.exports.squire(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangersquire') + 1];
};

module.exports.beholder = function (pick, game) {
    const action = doAction(game, pick);

    game._players
        .filter(player => playerThinksTheyAre(player, SEER_ROLES))
        .forEach(player => action.player(player));

    action.peek().do();

    game.mode = game.order[game.order.indexOf('beholder') + 1];
};

module.exports.dopplegangerbeholder = function (pick, game) {
    module.exports.beholder(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerbeholder') + 1];
};

module.exports.revealer = function (pick, game) {
    if (!pick.target || pick.target === pick.user.id) {
        throwFatalError(pick);
    }

    doAction(game, pick)
        .player(pick.target)
        .peek()
        .do();

    forPlayer(pick.target, target => {
        if (target.shield) {
            throwFatalError(pick);
        }

        if (target._hidden.role !== 'werewolf' && target._hidden.role !== 'tanner') {
            target.role = target._hidden.role;
        }
    }, game);

    game.mode = game.order[game.order.indexOf('revealer') + 1];
};

module.exports.dopplegangerrevealer = function (pick, game) {
    module.exports.revealer(pick, game);
    game.mode = game.order[game.order.indexOf('dopplegangerrevealer') + 1];
};

module.exports.curator = function (pick, game, artifactToSplice) {
    let artifacts = ARTIFACTS.slice();

    if (artifactToSplice) {
        artifacts = artifacts.splice(artifactToSplice, 1);
    }

    if (pick.target) {
        doAction(game, pick)
            .player(pick.target)
            .attributes({ artifact: true })
            .do();

        forPlayer(pick.target, player => {
            player._private.artifact = _.shuffle(artifacts)[0];
        }, game);
    }

    game.mode = game.order[game.order.indexOf('curator') + 1];
};

module.exports.dopplegangercurator = function (pick, game) {
    const playerWithArtifact = game._players.find(player => player.artifact);
    module.exports.curator(pick, game, playerWithArtifact && playerWithArtifact._private.artifact);
    game.mode = game.order[game.order.indexOf('dopplegangercurator') + 1];
};