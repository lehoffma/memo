import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {SearchResultComponent} from "./search-results.component";

const routes: Route[] = [
	{path: "search", component: SearchResultComponent},
	{path: "shop", redirectTo: "/search", pathMatch: "full"},
	{path: "tours", redirectTo: "/search?category=tours&date=upcoming", pathMatch: "full"},
	{path: "partys", redirectTo: "/search?category=partys&date=upcoming", pathMatch: "full"},
	{path: "merch", redirectTo: "/search?category=merch&date=upcoming", pathMatch: "full"},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SearchRoutingModule {
}

export const routedComponents = [SearchResultComponent];
