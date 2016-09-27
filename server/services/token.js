const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks');

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use('token', dbService({Model: r, name: 'token'}));

        app.service('token').before({
            all: hooks.disable('external')
        });
    });
};