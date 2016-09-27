import feathers from './feathers';

export function subscribeAll(dispatch) {
    feathers.service('games').on('created', game => dispatch({ type: 'REALTIME_GAME_CREATED', data: game }));
    feathers.service('games').on('updated', game => dispatch({ type: 'REALTIME_GAME_UPDATED', data: game }));
    feathers.service('games').on('patched', game => dispatch({ type: 'REALTIME_GAME_PATCHED', data: game }));
    feathers.service('games').on('removed', game => dispatch({ type: 'REALTIME_GAME_REMOVED', data: game }));
    feathers.service('users').on('created', user => dispatch({ type: 'REALTIME_USER_CREATED', data: user }));
    feathers.service('users').on('updated', user => dispatch({ type: 'REALTIME_USER_UPDATED', data: user }));
    feathers.service('users').on('patched', user => dispatch({ type: 'REALTIME_USER_PATCHED', data: user }));
    feathers.service('users').on('removed', user => dispatch({ type: 'REALTIME_USER_REMOVED', data: user }));
}