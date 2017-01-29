const imgur = require('imgur');

function validateAlbum({ value }) {
    return new Promise((resolve, reject)=>{
        getAlbum(value).then(
            album => album ? resolve(true) : reject(false),
            err => reject(ex ? ex.message || ex.toString() : 'Error')
        );
    });
}

module.exports.getAlbum = function getAlbum(url) {
    const index = url.lastIndexOf('/');

    let albumName;

    if (index === -1) {
        albumName = url;
    } else {
        albumName = url.substr(index + 1);
    }

    return new Promise((resolve, reject)=>{
        imgur.getAlbumInfo(albumName)
            .then(function(json) {
                if (!json || !json.success || json.status !== 200 || !json.data.images || json.data.images.length < 84) {
                    reject(new Error('Unexpected response'));
                } else {
                    resolve(json.data.images);
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
};

module.exports.getConfiguration = function getConfiguration() {
    return {
        name: 'Trixit',
        minPlayers: 3,
        maxPlayers: 8,
        options: [{
            label: 'Imgur Album',
            name: 'album',
            type: 'text',
            validate: validateAlbum
        }]
    }
};