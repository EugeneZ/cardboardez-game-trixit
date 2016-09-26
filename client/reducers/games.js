export default function(state = [], action) {
    switch (action.type) {
        case 'FETCH_GAMES_SUCCESS':
            return action.data;
        case 'CREATE_GAME_SUCCESS':
            state = state.splice();
            state.push(action.data);
            return state;
        default:
            return state;
    };
};