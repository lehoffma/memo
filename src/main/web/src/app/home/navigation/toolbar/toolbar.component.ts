import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Link} from "../../../shared/model/link";
import {WindowService} from "../../../shared/services/window.service";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, first, map} from "rxjs/operators";
import {NotificationService} from "../../../shared/services/api/user-notification.service";
import {QueryParameterService} from "../../../shared/services/query-parameter.service";
import {Router} from "@angular/router";

@Component({
	selector: "memo-toolbar",
	templateUrl: "./toolbar.component.html",
	styleUrls: ["./toolbar.component.scss", "./element/toolbar-element.component.scss"]
})
export class ToolbarComponent implements OnInit {
	@Input() transparent = false;

	//todo fadeout on mobile when searching


	/**
	 * Ein Event, welches beim öffnen der Sidenav Navigation emitted wird
	 * @type {EventEmitter}
	 */
	@Output() sideBarOpened = new EventEmitter();


	//die links die vom User gesehen werden dürfen als observable
	links: Observable<Link[]> = this.navigationService.toolbarLinks$;

	shoppingCartContent: Observable<number> = this.shoppingCartService.amountOfCartItems;

	searchIsExpanded$ = new BehaviorSubject(false);
	unreadNotifications$ = this.notificationService.unreadNotifications$;


	constructor(private navigationService: NavigationService,
				private router: Router,
				private notificationService: NotificationService,
				private windowService: WindowService,
				private shoppingCartService: ShoppingCartService) {
	}

	ngOnInit() {

	}

	/**
	 * Callback für das "Hamburger"-Menü (welches die Sidenav Komponente toggled)
	 */
	sideBarChanged() {
		this.sideBarOpened.emit({
			value: true
		});
	}

	search(keyword: string){
		const isSearchPage = this.router.url.includes("shop/search");
		//todo: if on shop search page: keep query params | else erase them
		const currentParams = isSearchPage ? this.navigationService.queryParams$.getValue() : {};
		const updatedParams = QueryParameterService.updateQueryParams(currentParams,
			{searchTerm: keyword ? keyword : null}
		);

		this.router.navigate(["shop", "search"], {queryParams: updatedParams});
	}

	expandSearchBar(event) {
		this.windowService.dimension$
			.pipe(
				map(it => it.width),
				first(),
				filter(width => width < 400)
			)
			.subscribe(it => this.searchIsExpanded$.next(event), console.error);

		this.windowService.dimension$
			.pipe(
				map(it => it.width),
				filter(width => width >= 400),
				first()
			)
			.subscribe(it => this.searchIsExpanded$.next(false), console.error);
	}
}
