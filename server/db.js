const config = require('config');
const r = require('rethinkdbdash')({
    servers: config.db.hosts,
    db: config.db.name
});

module.exports = r.dbList().contains(config.db.name)
    .do(dbExists => r.branch(dbExists, {created: 0}, r.dbCreate(config.db.name))).run()

    .then(() => {
        const promises = [],
            tables = ['users', 'actions', 'games', 'token'];
        for(var table in tables) {
            promises.push(r.db(config.db.name).tableList().contains(tables[table])
                .do(tableExists => r.branch( tableExists, {created: 0}, r.tableCreate(tables[table]))).run());
        }
        return Promise.all(promises);
    })

    .then(() => r);