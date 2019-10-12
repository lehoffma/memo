const SentryCli = require('@sentry/cli');

const GITHUB_REF = process.env.GITHUB_REF;
const GITHUB_SHA = process.env.GITHUB_SHA;

async function createReleaseAndUpload() {
	const release = GITHUB_SHA;
	if (!GITHUB_SHA) {
		console.warn('GITHUB_REF or GITHUB_SHA are not set');
		return;
	}
	const cli = new SentryCli();
	try {
		console.log('Creating sentry release ' + release);
		await cli.releases.new(release);
		console.log('Uploading source maps');
		await cli.releases.uploadSourceMaps(release, {
			include: ['src/main/webapp'],
            //todo
			// urlPrefix: '~/',
			rewrite: false,
		});
		console.log('Finalizing release');
		await cli.releases.finalize(release);
	} catch (e) {
		console.error('Source maps uploading failed:', e);
	}
}

console.log(GITHUB_REF);
console.log("is dev: " + (GITHUB_REF === "develop"));
console.log("is release: " + (GITHUB_REF === "release"));
if(null !== null){
	createReleaseAndUpload();
}
