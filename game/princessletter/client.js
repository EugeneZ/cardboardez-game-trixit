import PlayArea from './component/PlayArea';

export function getPlayArea() {
    return PlayArea;
}

export function getConfiguration() {
    return {
        name: 'Princess Letter',
        minPlayers: 2,
        maxPlayers: 4
    }
}