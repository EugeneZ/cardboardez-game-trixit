import _ from 'lodash';

export default function(state = [], action) {
    switch (action.type) {
        case 'FETCH_GAMES_SUCCESS':
            return action.data;
        case 'CREATE_GAME_SUCCESS':
            state = state.splice();
            state.push(action.data);
            return state;
        case 'REALTIME_GAME_UPDATED':
            state = _.remove(state.splice(), game => game.id === action.data.id);
            state.push(action.data);
            return state;
        default:
            return state;
    };
};