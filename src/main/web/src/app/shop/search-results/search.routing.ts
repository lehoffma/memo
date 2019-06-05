import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {SearchResultComponent} from "./search-results.component";

const routes: Route[] = [
	{path: "shop/search", component: SearchResultComponent},
	{path: "shop", redirectTo: "/shop/search?date=upcoming", pathMatch: "full"},
	{path: "shop/tours", redirectTo: "/shop/search?date=upcoming&type=1", pathMatch: "full"},
	{path: "shop/events", redirectTo: "/shop/search?&date=upcoming&type=2", pathMatch: "full"},
	{path: "shop/partys", redirectTo: "/shop/search?&date=upcoming&type=2", pathMatch: "full"},
	{path: "shop/merchandise", redirectTo: "/shop/search?type=3", pathMatch: "full"},
	{path: "shop/merch", redirectTo: "/shop/search?type=3", pathMatch: "full"},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SearchRoutingModule {
}

export const routedComponents = [SearchResultComponent];
