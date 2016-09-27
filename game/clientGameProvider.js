import TrixitPlayArea from './trixit/component/PlayArea';

export function getPlayArea(game) {
    if (game.game === 'trixit') {
        return TrixitPlayArea;
    }
}