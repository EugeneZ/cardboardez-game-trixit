import feathers from '../feathers';

export default function (state = feathers.get('user') || {}, action) {
    if (action.type === 'LOGOUT_SUCCESS') {
        return {};
    } else {
        return state;
    }
};