const config = require('config');
const feathers = require('feathers');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const authentication = require('./server/authentication');
const dbPromise = require('./server/db');
const services = require('./server/services');

const app = feathers();

services(app, dbPromise);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.configure(hooks());
app.configure(rest());
app.configure(socketio());
app.configure(authentication(app, dbPromise));
app.use(errorHandler());
app.use(feathers.static('public'));

app.listen(config.port);