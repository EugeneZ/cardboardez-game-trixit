import React from 'react';
import { getPlayArea } from '../../game/clientGameProvider';
import PlayArea from '../../game/trixit/component/PlayArea';
export default function(props) {
    return React.createElement(getPlayArea(props.games.filter(game=>game.id === props.params.id)[0]), props);
}