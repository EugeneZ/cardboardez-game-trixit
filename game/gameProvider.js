module.exports.getGameServerModule = function(game) {
    const gamename = game.game.replace(/[^A-Za-z0-9_-]/g, '');
    return require(`./${gamename}/server`);
};