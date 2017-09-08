import {HomeComponent} from "./home/home.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {PageNotFoundComponent} from "./shared/page-not-found/page-not-found.component";
import {Route} from "@angular/router";

export const ROUTES: Route[] = [
	{path: "", component: HomeComponent},

	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImprintComponent},

	{path: "**", component: PageNotFoundComponent},
	{path: "page-not-found", component: PageNotFoundComponent},
];
