import {getAppConfig} from "./app/app-config.service";

declare var gtag;

export function insertGoogleAnalyticsHeadScripts(): Promise<void> {
	const head = document.getElementsByTagName("head")[0];
	return getAppConfig().then(memoConfig => {
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
	})
}

export function googleAnalytics(url): Promise<void> {
	return getAppConfig()
		.then(memoConfig => {
			gtag("config", memoConfig.analyticsKey, {"page_path": url});
		});
}
