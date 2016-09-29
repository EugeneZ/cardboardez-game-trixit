export default function(state = [], action) {
    switch (action.type) {
        case 'FETCH_GAMES_SUCCESS':
            return action.data;
        case 'REALTIME_GAME_CREATED':
            state = state.splice();
            state.push(action.data);
            return state;
        case 'REALTIME_GAME_UPDATED':
            state = state.splice().filter(game => game.id !== action.data.id);
            state.push(action.data);
            return state;
        case 'REALTIME_GAME_REMOVED':
            return state.splice().filter(game => game.id !== action.data.id);
        default:
            return state;
    };
};