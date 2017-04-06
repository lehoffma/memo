import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {NavigationService} from "../../shared/services/navigation.service";
import {Link} from "../../shared/model/link";
import {Observable} from "rxjs/Observable";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";
import {LogInService} from "../../shared/services/login.service";
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

	//der pfad zum profilbild des users TODO durch richtigen pfad ersetzen
	imagePath: string = "../../../resources/images/nils.PNG";

	shoppingCartContent: Observable<number> = this.shoppingCartService.amountOfCartItems;

	constructor(private navigationService: NavigationService,
				private loginService: LogInService,
				private shoppingCartService: ShoppingCartService) {

	}

	ngOnInit() {

	}

	/**
	 * Navigiert zur angegebenen URL
	 * @param url
	 */
	takeToPage(url: string) {
		this.navigationService.navigateByUrl(url);
	}

	/**
	 * Callback für das "Hamburger"-Menü (welches die Sidenav Komponente toggled)
	 */
	sideBarChanged() {
		this.sideBarOpened.emit({
			value: true
		});
	}


}
