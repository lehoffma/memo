import {Component, Input, OnInit} from "@angular/core";
import {Breadcrumb} from "./breadcrumb";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BreadcrumbService} from "./breadcrumb.service";
import {distinctUntilChanged, filter, map, mergeMap} from "rxjs/operators";

@Component({
	selector: "memo-breadcrumb-navigation",
	templateUrl: "./breadcrumb-navigation.component.html",
	styleUrls: ["./breadcrumb-navigation.component.scss"]
})
export class BreadcrumbNavigationComponent implements OnInit {

	breadcrumbs$ = this.router.events.pipe(
		filter(event => event instanceof NavigationEnd),
		distinctUntilChanged(),
		mergeMap(event =>  this.breadcrumbService.buildBreadCrumb(this.activatedRoute))
	);


	constructor(private router: Router,
				private activatedRoute: ActivatedRoute,
				private breadcrumbService: BreadcrumbService) {
	}

	ngOnInit() {
	}

}
