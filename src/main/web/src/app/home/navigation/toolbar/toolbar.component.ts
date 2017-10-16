import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Link} from "../../../shared/model/link";
import {WindowService} from "../../../shared/services/window.service";

@Component({
	selector: "memo-toolbar",
	templateUrl: "./toolbar.component.html",
	styleUrls: ["./toolbar.component.scss", "./element/toolbar-element.component.scss"]
})
export class ToolbarComponent implements OnInit {
	/**
	 * Ein Event, welches beim öffnen der Sidenav Navigation emitted wird
	 * @type {EventEmitter}
	 */
	@Output() sideBarOpened = new EventEmitter();


	//die links die vom User gesehen werden dürfen als observable
	links: Observable<Link[]> = this.navigationService.toolbarLinks;


	shoppingCartContent: Observable<number> = this.shoppingCartService.amountOfCartItems;

	searchIsExpanded = false;

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
			.map(dimensions => dimensions.width)
			.first()
			.subscribe(width => {
				if (width < 400) {
					//todo expand to full width or something like that
					// this.searchIsExpanded = event;
				}
			});

		this.windowService.dimension$
			.map(dim => dim.width)
			.filter(width => width >= 400)
			.first()
			.subscribe(width => this.searchIsExpanded = false);
	}
}
