const imgur = require('imgur');
const merge = require('lodash/merge');

function getAlbum(url) {
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
}

function validateAlbum({ value }) {
    return new Promise((resolve, reject)=>{
        getAlbum(value).then(
            album => album ? resolve(true) : reject(false),
            err => reject(ex ? ex.message || ex.toString() : 'Error')
        );
    });
}

function presubmit(gameData) {
    const { options: { album }} = gameData;
    return new Promise((resolve, reject) => {
        if (!album) {
            reject(`Imgur album is required.`);
            return;
        }

        getAlbum(album).then(images => {
            if (images.length < 80) {
                reject(`Imgur album has less than 80 images!`);
                return;
            }

            resolve(merge({},gameData,{
                options: {
                    images: images.map(imageData => imageData.link)
                }
            }));
        }, err => reject(err));
    });
}

module.exports.getAlbum = getAlbum;

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
        }],
        hooks: {
            presubmit
        }
    }
};