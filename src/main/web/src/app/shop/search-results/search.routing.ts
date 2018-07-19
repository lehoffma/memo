import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {SearchResultComponent} from "./search-results.component";

const routes: Route[] = [
	{path: "search", component: SearchResultComponent},
	{path: "shop", redirectTo: "/search", pathMatch: "full"},
	{path: "tours", redirectTo: "/search?type=1&date=upcoming", pathMatch: "full"},
	{path: "events", redirectTo: "/search?type=2&date=upcoming", pathMatch: "full"},
	{path: "partys", redirectTo: "/search?type=2&date=upcoming", pathMatch: "full"},
	{path: "merchandise", redirectTo: "/search?type=3", pathMatch: "full"},
	{path: "merch", redirectTo: "/search?type=3", pathMatch: "full"},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SearchRoutingModule {
}

export const routedComponents = [SearchResultComponent];
