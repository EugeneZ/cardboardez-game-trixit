/**
 * This file is a good place to organize inter-service dependencies. Use the promise to manage timing. Returns a promise
 * that resolves when the services are ready.
 * @param app - feathers app
 * @param dbPromise - a Promise that resolves after the database connection is complete for services that depend on db
 */
module.exports = function(app, dbPromise) {
    return Promise.all([
        (require('./services/games'))(app, dbPromise),
        (require('./services/token'))(app, dbPromise),
        (require('./services/users'))(app, dbPromise)
    ]);
};