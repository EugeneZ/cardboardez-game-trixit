const dbService = require('feathers-rethinkdb');

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use('games', dbService({Model: r, name: 'games'}));
    });
};