const dbService = require('feathers-rethinkdb');
const hooks = require('feathers-hooks');

module.exports = function(app, dbPromise) {
    return dbPromise.then(r => {
        app.use('users', dbService({Model: r, name: 'users'}));

        app.service('users').before({
            create: [hooks.disable('external'), hooks.pluck('id', 'name')],
            update: [hooks.disable('external'), hooks.pluck('id', 'name')],
            patch : [hooks.disable('external'), hooks.pluck('id', 'name')],
            remove: [hooks.disable('external'), hooks.pluck('id', 'name')]
        });

        app.service('users').after({
            get     : hooks.pluck('id', 'name'),
            find    : hooks.pluck('id', 'name')
        });

        // TODO: When this bug is fixed in feathers, move this to a hook. https://github.com/feathersjs/feathers/issues/376
        app.service('users').filter(function(data){
            return { id: data.id, name: data.name };
        });

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