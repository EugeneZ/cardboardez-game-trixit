export default function (state = [], action) {
    switch (action.type) {
        case 'FETCH_USERS_SUCCESS':
            return action.data;
        case 'REALTIME_USER_CREATED':
            state = state.splice();
            state.push(action.data);
            return state;
        case 'REALTIME_USER_UPDATED':
            state = state.splice().filter(user => user.id !== action.data.id);
            state.push(action.data);
            return state;
        case 'REALTIME_USER_REMOVED':
            return state.splice().filter(user => user.id !== action.data.id);
        default:
            return state;
    }
};