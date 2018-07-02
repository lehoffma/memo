import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Link} from "../../../shared/model/link";
import {WindowService} from "../../../shared/services/window.service";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, first, map} from "rxjs/operators";

@Component({
	selector: "memo-toolbar",
	templateUrl: "./toolbar.component.html",
	styleUrls: ["./toolbar.component.scss", "./element/toolbar-element.component.scss"]
})
export class ToolbarComponent implements OnInit {
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

	constructor(private navigationService: NavigationService,
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
