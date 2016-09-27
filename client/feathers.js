import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import authentication from 'feathers-authentication/client';
import io from 'socket.io-client';

const socket = io();
const app = feathers()
    .configure(socketio(socket))
    .configure(hooks())
    .configure(authentication({ storage: window.localStorage }));

// When the transport changes, we need to re-authenticate
socket.io.engine.on('upgrade', () => app.authenticate().catch(()=>{}));

export default app;