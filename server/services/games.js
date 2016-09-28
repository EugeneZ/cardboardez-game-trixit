const config = require('config');
const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks');
const gameProvider = require('../../game/gameProvider');

const ENDPOINT = `/${config.api}/games`;

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use(ENDPOINT, dbService({Model: r, name: 'games'}));

        /**
         * This hook removes the 'hasPlayer' query param from the client so that we can do our own manual processing
         * in the after hook. If this wasn't here, the db service would look for games with a 'hasPlayer' field with
         * this value.
         */
        app.service(ENDPOINT).before({
            find(hook) {
                const { params } = hook,
                      { query } = params;

                if (query.hasPlayer) {
                    params.hasPlayer = query.hasPlayer;
                    delete query.hasPlayer;
                }
            },

            create(hook) {
                const module = gameProvider.getGameServerModule(hook.data);
                module.setup(Object.assign(hook.data, { _hidden: {}, _players: hook.data.players.map(id=>({id, _hidden: {}, _private: {}}))}));
                hook.data.updated = new Date();
            },

            update(hook) {
                const module = gameProvider.getGameServerModule(hook.data);
                const game = app.service(ENDPOINT).get(hook.data.id);
                module[game.mode()](hook.data, game);
                hook.data.updated = new Date();
            },
            patch : hooks.disable('external'),
            remove: hooks.disable('external')
        });

        /**
         * If the 'hasPlayer' query param was passed in to the service, it has been moved from the query to the params
         * themselves to avoid collision with actual db queries. We now use this field to return only the relevant games.
         */
        app.service(ENDPOINT).after({
            find(hook) {
                const { hasPlayer } = hook.params;

                if (hasPlayer) {
                    hook.result = hook.result.filter(game => game.players.indexOf(hasPlayer) !== -1);
                }
            }
        });

        /**
         * Only emit events about games to users who are playing that game.
         */
        app.service(ENDPOINT).filter(function(data, connection) {
            if(data.players.indexOf(connection.user.id) === -1) {
                return false;
            }

            return data;
        });

        /**
         * Hide hidden information from players
         */
        app.service(ENDPOINT).filter(function(data, connection) {
            if(data.players.indexOf(connection.user.id) === -1) {
                return false;
            }

            return data;
        });
    });
};