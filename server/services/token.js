const dbService = require('feathers-rethinkdb');

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use('token', dbService({Model: r, name: 'token'}));
    });
};