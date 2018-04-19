import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";

import {AppModule} from "./app/app.module";
import {environment} from "./environments/environment";
import {insertGoogleAnalyticsHeadScripts} from "./google-analytics-init";

if (environment.production) {
	enableProdMode();
}

insertGoogleAnalyticsHeadScripts()

platformBrowserDynamic().bootstrapModule(AppModule);
