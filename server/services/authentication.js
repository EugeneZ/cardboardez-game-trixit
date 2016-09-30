const config = require('config');
const authentication = require('feathers-authentication');
const facebookStrategy = require('passport-facebook').Strategy;
const googleStrategy = require('passport-google-oauth20').Strategy;
const githubStrategy = require('passport-github').Strategy;

/**
 * Configures the authentication service (/auth/*) used for passport-style SSO
 * @param app - feathers app
 */
module.exports = function(app){
    return authentication({
        idField: 'id',
        userEndpoint: `/${config.api}/users`,
        shouldSetupSuccessRoute: false,
        successRedirect: '/profile',
        cookie: {
            secure: false // This seems like an insecure choice, but... this a board gaming website. Certs are a pain in the ass. There's nothing to gain by attacking this.
        },

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
        }
    });
};