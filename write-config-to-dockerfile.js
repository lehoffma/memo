const replace = require('replace-in-file');
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_USER_NAME = process.env.EMAIL_USER_NAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_PORT = process.env.EMAIL_PORT;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_ACCESS_TOKEN_KEY = process.env.JWT_ACCESS_TOKEN_KEY;
const JWT_REFRESH_TOKEN_KEY = process.env.JWT_REFRESH_TOKEN_KEY;
const SENTRY_DSN = process.env.SENTRY_DSN;

const SENTRY_RELEASE = process.env.GITHUB_SHA;

//this script writes the maps/analytics api keys from the CI environment to the environment files so we can use them
//in the app
const replacements = [
    {from: /{EMAIL_HOST}/g, to: EMAIL_HOST},
    {from: /{EMAIL_USER}/g, to: EMAIL_USER},
    {from: /{EMAIL_USER_NAME}/g, to: EMAIL_USER_NAME},
    {from: /{EMAIL_PASSWORD}/g, to: EMAIL_PASSWORD},
    {from: /{EMAIL_PORT}/g, to: EMAIL_PORT},
    {from: /{ADMIN_EMAIL}/g, to: ADMIN_EMAIL},
    {from: /{ADMIN_PASSWORD}/g, to: ADMIN_PASSWORD},
    {from: /{JWT_ACCESS_TOKEN_KEY}/g, to: JWT_ACCESS_TOKEN_KEY},
    {from: /{JWT_REFRESH_TOKEN_KEY}/g, to: JWT_REFRESH_TOKEN_KEY},
    {from: /{SENTRY_DSN}/g, to: SENTRY_DSN},
    {from: /{SENTRY_RELEASE}/g, to: SENTRY_RELEASE},
];

try {
    let changedFiles = replacements.reduce((acc, replacement) => {
        acc.push(
            ...replace.sync({
                files: 'Dockerfile',
                from: replacement.from,
                to: replacement.to,
                allowEmptyPaths: false,
            })
        );
        return acc;
    }, []);

    console.log("performed " + changedFiles.length + " replacements");

    console.log("ENV's set");
} catch (error) {
    console.error('Error occurred:', error);
}
