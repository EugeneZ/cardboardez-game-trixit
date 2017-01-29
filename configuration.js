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
                if (!json || !json.success || json.status !== 200 || !json.data.images) {
                    reject('Unexpected response, are you sure this is an Imgur album?');
                } else if (json.data.images.length < 84) {
                    reject('Imgur album must contain at least 84 images');
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
            err => reject(err ? err.message || err.toString() : 'Error')
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
            if (images.length < 84) {
                reject(`Imgur album has less than 84 images!`);
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