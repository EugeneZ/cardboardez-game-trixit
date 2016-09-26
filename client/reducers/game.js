export default function(state = {}, action) {
    switch (action.type) {
        case 'CREATE_GAME_SUCCESS':
            return action.data;
        default:
            return state;
    };
};