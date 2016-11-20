import PlayArea from './component/PlayArea';

export function getPlayArea() {
    return PlayArea;
}

export function getConfiguration() {
    return {
        name: 'Maui',
        minPlayers: 2,
        maxPlayers: 8
    }
}