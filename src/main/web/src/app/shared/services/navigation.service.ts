import {Injectable} from "@angular/core";
import {Link} from "../model/link";
import {Observable} from "rxjs/Observable";
import {ParamMap, Router, RoutesRecognized} from "@angular/router";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Address} from "../model/address";
import {EventType} from "../../shop/shared/model/event-type";
import {Event} from "../../shop/shared/model/event";
import {HttpClient} from "@angular/common/http";
import {LogInService} from "./api/login.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class NavigationService {
	public toolbarLinks: Observable<Link[]>;
	public sidenavLinks: Observable<Link[]>;
	public accountLinks: Observable<Link[]>;

	public redirectToTour: Address[] = [];


	queryParamMap$: BehaviorSubject<ParamMap> = new BehaviorSubject(null);


	constructor(private http: HttpClient,
				private loginService: LogInService,
				private router: Router) {
		this.initialize();

		this.router.events
			.filter(val => val instanceof RoutesRecognized)
			.map(val => (<RoutesRecognized>val).state.root.queryParamMap)
			.subscribe(map => this.queryParamMap$.next(map));
	}

	navigateToLogin() {
		this.loginService.redirectUrl = this.router.url;
		this.navigateByUrl("/login");
	}

	public navigateToItem(item: ShopItem | Event, suffix?: string) {
		this.navigateToItemWithId(EventUtilityService.getShopItemType(item), item.id, suffix);
	}

	public navigateToItemWithId(category: ShopItemType | EventType, id: number, suffix?: string) {
		let url = `${category}/${id}${(suffix ? suffix : "")}`;
		this.navigateByUrl(url);
	}

	//todo: do something other than just printing to console (show the error to the user or fallback to some default route)
	public navigateByUrl(url: string): void {
		this.router.navigateByUrl(url)
			.then(
				_ => _, //navigation was successful
				reason => {
					console.error(`navigation failed, reason: ${reason}`);
					throw new Error();
				}
			)
			.catch(
				error => {
					console.error(`error occurred while navigating, error message: ${error}`)
					throw new Error();
				}
			)
	}

	private initialize() {
		this.toolbarLinks = this.http.get<Link[]>("/resources/toolbar-links.json");
		this.sidenavLinks = this.http.get<Link[]>("/resources/sidenav-links.json");
		this.accountLinks = this.http.get<Link[]>("/resources/account-links.json");
	}
}
