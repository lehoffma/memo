import {HomeComponent} from "./home/home.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImpressumComponent} from "./home/impressum/impressum.component";
import {PageNotFoundComponent} from "./shared/utility/error-page/page-not-found.component";
import {Route} from "@angular/router";

export const ROUTES: Route[] = [
	{path: "", component: HomeComponent},

	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImpressumComponent},

	{path: "**", component: PageNotFoundComponent},
	{path: "page-not-found", component: PageNotFoundComponent},
];
