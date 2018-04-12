import {Injectable, OnDestroy} from "@angular/core";
import {Link} from "../model/link";
import {ParamMap, Router, RoutesRecognized} from "@angular/router";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Address} from "../model/address";
import {EventType} from "../../shop/shared/model/event-type";
import {Event} from "../../shop/shared/model/event";
import {HttpClient} from "@angular/common/http";
import {LogInService} from "./api/login.service";
import {Observable} from "rxjs/Observable";
import {filter, map, mergeMap} from "rxjs/operators";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {UserPermissions, visitorPermissions} from "../model/permission";
import {User} from "../model/user";
import {isNullOrUndefined} from "util";

@Injectable()
export class NavigationService implements OnDestroy {
	private _toolbarLinks$: BehaviorSubject<Link[]> = new BehaviorSubject<Link[]>([]);
	public toolbarLinks$: Observable<Link[]> = this._toolbarLinks$
		.pipe(
			mergeMap(links => this.loginService.currentUser$
				.pipe(
					map(user => this.filterLinks(user, links))
				)
			)
		);
	private _sidenavLinks$: BehaviorSubject<Link[]> = new BehaviorSubject<Link[]>([]);
	public sidenavLinks$: Observable<Link[]> = this._sidenavLinks$
		.pipe(
			mergeMap(links => this.loginService.currentUser$
				.pipe(
					map(user => this.filterLinks(user, links))
				)
			)
		);
	public accountLinks: Observable<Link[]>;

	public redirectToTour: Address[] = [];


	queryParamMap$: BehaviorSubject<ParamMap> = new BehaviorSubject(null);

	subscriptions = [];

	constructor(private http: HttpClient,
				private loginService: LogInService,
				private router: Router) {
		this.initialize();

		this.loginService.currentUser$.subscribe(it => console.log(it));

		this.subscriptions.push(this.router.events
			.pipe(
				filter(val => val instanceof RoutesRecognized),
				map(val => (<RoutesRecognized>val).state.root.queryParamMap)
			)
			.subscribe(it => {
				this.queryParamMap$.next(it);
			}));
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
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

	private filterLinks(user: User, links: Link[]): Link[] {
		const linksCopy: Link[] = [...links];
		const permissions = !user || user.id === -1
			? visitorPermissions
			: user.userPermissions();

		const setId = (link: Link): Link => {
			let newLink = {...link};
			if (newLink.children) {
				newLink.children = newLink.children.map(childLink => setId(childLink))
			}
			if (newLink.route !== null) {
				newLink.route = newLink.route.replace("PROFILE_ID", "" + (user ? user.id : -1));
			}
			return newLink;
		};

		const isShown = (link: Link) => (!link.loginNeeded || (user && user.id !== -1))
			&& this.checkPermissions(link.minimumPermission, permissions);

		const filterOutChildren = (link: Link): Link => {
			if (link.children) {
				link.children = link.children
					.filter(it => isShown(it))
					.map(it => filterOutChildren(it));
			}
			return link;
		};

		return linksCopy.map(setId)
			.filter(link => isShown(link))
			.map(link => filterOutChildren(link))
	}


	/**
	 *
	 * @param minimumPermissions die minimalen Berechtigungsstufen, die der Nutzer erreichen/überschreiten muss,
	 *                           um den link anzusehen
	 * @param userPermissions die Berechtigungsstufen des Nutzers
	 * @returns {boolean}
	 */
	private checkPermissions(minimumPermissions: UserPermissions, userPermissions: UserPermissions = visitorPermissions) {
		if (isNullOrUndefined(minimumPermissions)) {
			return true;
		}
		if (isNullOrUndefined(userPermissions)) {
			userPermissions = visitorPermissions;
		}

		return Object.keys(minimumPermissions)
			.every(
				(key: string) =>
					!isNullOrUndefined(userPermissions[key])
					&& !isNullOrUndefined(minimumPermissions[key])
					&& userPermissions[key] >= minimumPermissions[key]
			);
	}


	private initialize() {
		this.http.get<Link[]>("/resources/toolbar-links.json")
			.subscribe(links => this._toolbarLinks$.next(links));
		this.http.get<Link[]>("/resources/sidenav-links.json")
			.subscribe(links => this._sidenavLinks$.next(links));
		this.accountLinks = this.http.get<Link[]>("/resources/account-links.json");
	}
}
