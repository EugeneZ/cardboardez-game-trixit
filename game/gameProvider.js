module.exports.getGameServerModule = function(game) {
    if (game.game === 'trixit'){
        return require('./trixit/server');
    }
};