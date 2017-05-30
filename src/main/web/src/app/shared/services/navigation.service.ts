import {Injectable} from "@angular/core";
import {Link} from "../model/link";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Address} from "../model/address";

@Injectable()
export class NavigationService {
	public toolbarLinks: Observable<Link[]>;
	public sidenavLinks: Observable<Link[]>;
	public accountLinks: Observable<Link[]>;

	public redirectToTour:Address[] = [];

	constructor(private http: Http,
				private eventUtilService: EventUtilityService,
				private router: Router) {
		this.initialize();
	}

	private initialize() {
		this.toolbarLinks = this.http.get("/resources/toolbar-links.json")
			.map(response => response.json());
		this.sidenavLinks = this.http.get("/resources/sidenav-links.json")
			.map(response => response.json());
		this.accountLinks = this.http.get("/resources/account-links.json")
			.map(response => response.json());
	}

	public navigateToItem(item: ShopItem, suffix?: string) {
		this.navigateToItemWithId(this.eventUtilService.getShopItemType(item), item.id, suffix);
	}

	public navigateToItemWithId(category: ShopItemType, id: number, suffix?: string) {
		let url = `${category}/${id}${(suffix ? suffix : "")}`;
		this.navigateByUrl(url);
	}

	//todo: do something other than just printing to console (show the error to the user or fallback to some default route)
	public navigateByUrl(url: string): void {
		this.router.navigateByUrl(url)
			.then(
				_ => _, //navigation was successful
				reason => console.error(`navigation failed, reason: ${reason}`)
			)
			.catch(
				error => console.error(`error occurred while navigating, error message: ${error}`)
			)
	}
}
