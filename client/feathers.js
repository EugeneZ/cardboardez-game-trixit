import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import authentication from 'feathers-authentication/client';
import io from 'socket.io-client';

export default feathers()
    .configure(socketio(io()))
    .configure(hooks())
    .configure(authentication({ storage: window.localStorage }));