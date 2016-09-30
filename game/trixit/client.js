import PlayArea from './component/PlayArea';

export function getPlayArea() {
    return PlayArea;
}

export function getConfiguration() {
    return {
        name: 'Trixit',
        minPlayers: 3,
        maxPlayers: 8
    }
}