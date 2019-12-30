import {ErrorHandler, Injectable} from "@angular/core";
import * as Sentry from '@sentry/browser';
import {AppConfigService} from "../app-config.service";
import {take} from "rxjs/operators";

@Injectable()
export class SentryErrorHandlerService implements ErrorHandler {
	constructor(private configService: AppConfigService) {
		configService.config$.pipe(take(1)).subscribe(config => {
			Sentry.init({
				dsn: config.sentryDsn,
				release: config.sentryRelease,
			});

		})
	}

	handleError(error) {
		console.error(error);
		Sentry.captureException(error.originalError || error);
		// throw error;
	}
}
