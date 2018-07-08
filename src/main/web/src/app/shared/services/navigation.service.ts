import {Injectable, OnDestroy} from "@angular/core";
import {Link} from "../model/link";
import {ParamMap, Router, RoutesRecognized} from "@angular/router";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {EventType} from "../../shop/shared/model/event-type";
import {Event} from "../../shop/shared/model/event";
import {HttpClient} from "@angular/common/http";
import {LogInService} from "./api/login.service";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map, mergeMap, tap} from "rxjs/operators";
import {UserPermissions, visitorPermissions} from "../model/permission";
import {User, userPermissions} from "../model/user";
import {isNullOrUndefined} from "util";

@Injectable()
export class NavigationService implements OnDestroy {
	public accountLinks: Observable<Link[]>;
	queryParamMap$: BehaviorSubject<ParamMap> = new BehaviorSubject(null);
	subscriptions = [];
	private _toolbarLinks$: BehaviorSubject<Link[]> = new BehaviorSubject<Link[]>([]);
	public toolbarLinks$: Observable<Link[]> = this._toolbarLinks$
		.pipe(
			mergeMap(links => this.loginService.currentUser$
				.pipe(
					map(user => this.filterLinks(user, links))
				)
			),
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

	constructor(private http: HttpClient,
				private loginService: LogInService,
				private router: Router) {
		this.initialize();

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

	/**
	 *
	 * @param {ShopItem | Event} item
	 * @param {string} suffix
	 */
	public navigateToItem(item: ShopItem | Event, suffix?: string) {
		this.navigateToItemWithId(EventUtilityService.getShopItemType(item), item.id, suffix);
	}

	/**
	 *
	 * @param {ShopItemType | EventType} category
	 * @param {number} id
	 * @param {string} suffix
	 * @returns {string}
	 */
	public getUrl(category: ShopItemType | EventType, id: number, suffix?: string): string {
		return `${category}/${id}${(suffix ? suffix : "")}`;
	}

	/**
	 *
	 * @param {ShopItem | Event} item
	 * @param {string} suffix
	 * @returns {string}
	 */
	public getUrlOfItem(item: ShopItem | Event, suffix?: string) {
		return this.getUrl(EventUtilityService.getShopItemType(item), item.id, suffix);
	}

	/**
	 *
	 * @param {ShopItemType | EventType} category
	 * @param {number} id
	 * @param {string} suffix
	 */
	public navigateToItemWithId(category: ShopItemType | EventType, id: number, suffix?: string) {
		let url = this.getUrl(category, id, suffix);
		this.navigateByUrl(url);
	}

	/**
	 *
	 * @param {string} url
	 */
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

	/**
	 *
	 * @param {User} user
	 * @param {Link[]} links
	 * @returns {Link[]}
	 */
	private filterLinks(user: User, links: Link[]): Link[] {
		const linksCopy: Link[] = [...links];
		const permissions = !user || user.id === -1
			? visitorPermissions
			: userPermissions(user);

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
