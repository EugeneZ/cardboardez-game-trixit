export default function(state = {}, action) {
    if (action.error){
        const temp = {};
        temp[action.type] = JSON.parse(JSON.stringify(action.error));
        return Object.assign({}, state, temp);
    } else {
        if (state[action.type]) {
            const temp = {};
            temp[action.type] = null;
            return Object.assign({}, state, temp);
        } else {
            return state;
        }
    }
}