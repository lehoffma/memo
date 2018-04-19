import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {SearchResultComponent} from "./search-results.component";

const routes: Route[] = [
	{path: "search", component: SearchResultComponent},
	{path: "shop", redirectTo: "/search", pathMatch: "full"},
	{path: "tours", redirectTo: "/search?category=tours", pathMatch: "full"},
	{path: "partys", redirectTo: "/search?category=partys", pathMatch: "full"},
	{path: "merch", redirectTo: "/search?category=merch", pathMatch: "full"},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SearchRoutingModule{}

export const routedComponents = [SearchResultComponent];
