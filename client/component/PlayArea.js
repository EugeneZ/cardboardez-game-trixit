import React from 'react';
import { getPlayArea } from '../../game/clientGameProvider';
import PlayArea from '../../game/trixit/component/PlayArea';
export default function(props) {
    if (!props.games || !props.games.length) {
        return null;
    }

    const game = props.games.filter(game=>game.id === props.params.id)[0];

    if (!game) {
        return <div>Game not allowed</div>;
    }

    return React.createElement(getPlayArea(game), props);
}