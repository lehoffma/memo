import {memoConfig} from "./app/app.config";

declare var gtag;

export function insertGoogleAnalyticsHeadScripts() {
	const head = document.getElementsByTagName("head")[0];

	const googleAnalyticsFirstScript = document.createElement("script");
	googleAnalyticsFirstScript.async = true;
	googleAnalyticsFirstScript.src = "https://www.googletagmanager.com/gtag/js?id=" + memoConfig.analyticsKey;

	const googleAnalyticsSecondScript = document.createElement("script");
	googleAnalyticsSecondScript.innerHTML = "    window.dataLayer = window.dataLayer || [];\n" +
		"    function gtag(){dataLayer.push(arguments);}\n" +
		"    gtag('js', new Date());\n" +
		"\n" +
		"    gtag('config', '" + memoConfig.analyticsKey + "');";

	head.insertBefore(googleAnalyticsSecondScript, head.firstChild);
	head.insertBefore(googleAnalyticsFirstScript, head.firstChild);
}

export function googleAnalytics(url) {
	gtag("config", memoConfig.analyticsKey, {"page_path": url});
}
