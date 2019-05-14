import {HomeComponent} from "./home/home.component";
import {PageNotFoundComponent} from "./shared/utility/error-page/page-not-found.component";
import {Route} from "@angular/router";

export const ROUTES: Route[] = [
	{path: "", component: HomeComponent},

	{path: "**", component: PageNotFoundComponent},
	{path: "page-not-found", component: PageNotFoundComponent},
];
