export default function (state = {}, action) {
    switch (action.type) {
        case 'AUTHENTICATE_SUCCESS':
            return action.data;
        case 'LOGOUT_SUCCESS':
            return {};
        default:
            return state;
    }
};