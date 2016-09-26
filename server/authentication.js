const config = require('config');
const authentication = require('feathers-authentication');
const facebookStrategy = require('passport-facebook').Strategy;
const googleStrategy = require('passport-google-oauth20').Strategy;
const githubStrategy = require('passport-github').Strategy;

module.exports = function(app, dbPromise){

    // normalize user data when creating users
    dbPromise.then(()=>{
        app.service('/users').before({
            create(hook) {
                const { facebook, github, google, twitter } = hook.data;
                if (github) {
                    hook.data.name = github.login;
                } else if (facebook) {
                    hook.data.name = facebook.name;
                } else if (google) {
                    hook.data.name = google.displayName;
                } else {
                    console.log(require('util').inspect(hook));
                }
            }
        });
    });

    return authentication({
        idField: 'id',
        userEndpoint: '/users',
        shouldSetupSuccessRoute: false,
        successRedirect: '/',

        facebook: {
            strategy: facebookStrategy,
            clientID: config.auth.facebook.clientID,
            clientSecret: config.auth.facebook.clientSecret,
            permissions: {
                authType: 'rerequest',
                'scope': ['public_profile', 'email']
            }
        },

        google: {
            strategy: googleStrategy,
            clientID: config.auth.google.clientID,
            clientSecret: config.auth.google.clientSecret,
            permissions: {
                scope: ['email', 'profile']
            }
        },

        github: {
            strategy: githubStrategy,
            clientID: config.auth.github.clientID,
            clientSecret: config.auth.github.clientSecret,
        },

        /*twitter: {
            idField: 'id',
            strategy: twitterStrategy,
            consumerKey: config.auth.twitter.clientID,
            consumerSecret: config.auth.twitter.clientSecret
        }*/
    });
};