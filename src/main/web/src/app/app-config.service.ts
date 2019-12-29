import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";
import {environment} from "../environments/environment";

export interface AppConfig {
	mapsApiKey: string;
	analyticsKey: string;
	sentryDsn: string;
	sentryRelease: string;
}

export function getAppConfig(): Promise<AppConfig> {
	//use environment variable, if available
	if (environment.GOOGLE_ANALYTICS_KEY !== "{GOOGLE_ANALYTICS_KEY}"
		&& environment.GOOGLE_MAPS_API_KEY !== "{GOOGLE_MAPS_API_KEY}"
		&& environment.SENTRY_DSN !== "{SENTRY_DSN}"
		&& environment.SENTRY_RELEASE !== "{SENTRY_RELEASE}"

	) {
		const analyticsKey = environment.GOOGLE_ANALYTICS_KEY;
		const mapsApiKey = environment.GOOGLE_MAPS_API_KEY;
		const sentryDsn = environment.SENTRY_DSN;
		const sentryRelease = environment.SENTRY_RELEASE;

		if (mapsApiKey && analyticsKey) {
			return Promise.resolve({
				analyticsKey,
				mapsApiKey,
				sentryDsn,
				sentryRelease
			} as AppConfig)
		}
	}

	//use local copy
	return import(
		/*webpackIgnore: true*/
		// @ts-ignore
		"./resources/app.config.js"
		)
		.then(it => it.config)
		.catch(error => {
			console.error(error);
			return null;
		});
}

@Injectable({
	providedIn: "root"
})
export class AppConfigService {
	_config$: BehaviorSubject<AppConfig> = new BehaviorSubject<AppConfig>(null);
	config$: Observable<AppConfig> = this._config$.asObservable().pipe(
		filter(it => it !== null)
	);

	constructor() {
		getAppConfig().then(it => this._config$.next(it));
	}

	get config() {
		return this._config$.getValue();
	}
}
