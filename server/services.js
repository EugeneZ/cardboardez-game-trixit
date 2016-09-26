const dbService = require('feathers-rethinkdb');

module.exports = function(app, dbPromise) {
    dbPromise.then(r => {
        app.use('users', dbService({Model: r, name: 'users'}));
        app.use('games', dbService({Model: r, name: 'games'}));
        app.use('token', dbService({Model: r, name: 'token'}));
    });
};