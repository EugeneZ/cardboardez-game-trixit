const dbService = require('feathers-rethinkdb');

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use('users', dbService({Model: r, name: 'users'}));

        app.service('users').before({
            create(hook) {
                const { facebook, github, google } = hook.data;
                if (github) {
                    hook.data.name = github.login;
                } else if (facebook) {
                    hook.data.name = facebook.name;
                } else if (google) {
                    hook.data.name = google.displayName;
                } else {
                    console.log(require('util').inspect(hook));
                }
            }
        });

    });
};