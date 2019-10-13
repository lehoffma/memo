const replace = require('replace-in-file');
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_ANALYTICS_KEY = process.env.GOOGLE_ANALYTICS_KEY;
const SENTRY_DSN = process.env.SENTRY_DSN;

//this script writes the maps/analytics api keys from the CI environment to the environment files so we can use them
//in the app
try {
	let changedFiles = replace.sync({
		files: 'src/environments/*.ts',
		from: /{GOOGLE_MAPS_API_KEY}/g,
		to: GOOGLE_MAPS_API_KEY,
		allowEmptyPaths: false,
	});

	changedFiles.push(...replace.sync({
		files: 'src/environments/*.ts',
		from: /{GOOGLE_ANALYTICS_KEY}/g,
		to: GOOGLE_ANALYTICS_KEY,
		allowEmptyPaths: false,
	}));

	changedFiles.push(...replace.sync({
		files: 'src/environments/*.ts',
		from: /{SENTRY_DSN}/g,
		to: SENTRY_DSN,
		allowEmptyPaths: false,
	}));

	console.log("performed " + changedFiles.length + " replacements");

	console.log("API Keys set");
} catch (error) {
	console.error('Error occurred:', error);
}
