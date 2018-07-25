import {Injectable} from "@angular/core";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {Breadcrumb} from "./breadcrumb";
import {Observable, of} from "rxjs";
import {catchError, map, mergeMap} from "rxjs/operators";
import {UserService} from "../services/api/user.service";
import {EventService} from "../services/api/event.service";
import {User} from "../model/user";
import {Event} from "../../shop/shared/model/event";
import {OrderService} from "../services/api/order.service";

@Injectable({
	providedIn: "root"
})
export class BreadcrumbService {

	readonly translations: { [english: string]: { [targetLocale: string]: string } } = {
		"tours": {de: "Touren"},
		"search": {de: "Suche"},
		"orders": {de: "Bestellungen"},
		"costs": {de: "Kosten"},
		"stock": {de: "Bestand"},
		"management": {de: "Vereinsverwaltung"},
		"edit": {de: "Bearbeiten"},
		"conclude": {de: "Abschluss"},
		"members": {de: "Mitglieder"},
		"cart": {de: "Warenkorb"},
		"calendar": {de: "Kalender"},
		"applyForMembership": {de: "Mitglied werden"},
		"requestMembership": {de: "Mitgliedsstatus ändern"},
		"my-events": {de: "Deine Events"},
		"order-history": {de: "Deine Bestellungen"},
		"create": {de: "Erstellen"},
		"entries": {de: "Kosten"}
	};

	currentLocale = "de";

	constructor(private userService: UserService,
				private eventService: EventService,
				private orderService: OrderService) {
	}

	buildBreadCrumb(route: ActivatedRoute): Observable<Breadcrumb[]> {
		const snapshot = route.snapshot.firstChild;
		const snapshotUrl = [...snapshot.url];
		const [url, ...urlList] = snapshotUrl;
		return this.toBreadCrumb(url, urlList, "/", of([
			{
				label: "Startseite",
				link: "/"
			} as Breadcrumb
		]));
	}

	private getLabel(link: string, path: string): Observable<string> {
		if (this.translations[path]) {
			return of(this.translations[path][this.currentLocale]);
		}

		if (!isNaN(+path)) {
			const id = +path;
			//try eventservice, userservice
			//otherwise, just return the number
			if (link.includes("members")) {
				return this.userService.getById(id).pipe(
					map((user: User) => user.firstName + " " + user.surname),
					catchError(e => of("" + id))
				)
			}
			if (link.includes("tours") || link.includes("merch") || link.includes("partys")) {
				return this.eventService.getById(id).pipe(
					map((event: Event) => event.title),
					catchError(e => of("" + id))
				)
			}
		}

		return of(path[0].toUpperCase() + path.slice(1));
	}

	private toBreadCrumb(urlSegment: UrlSegment, url: UrlSegment[], link: string,
						 breadcrumbs: Observable<Breadcrumb[]> = of([])): Observable<Breadcrumb[]> {
		if (!urlSegment) {
			return breadcrumbs;
		}

		const path = urlSegment.path;
		const nextLink = link + path + "/";
		const [nextUrlSegment, ...nextUrl] = [...url];

		return this.toBreadCrumb(
			nextUrlSegment,
			nextUrl,
			nextLink,
			breadcrumbs.pipe(
				mergeMap((crumbs): Observable<Breadcrumb[]> => {
					return this.getLabel(nextLink, path).pipe(
						map(label => [
							...crumbs,
							{
								label,
								link: nextLink
							} as Breadcrumb
						])
					)
				})
			)
		)
	}

	toJsonLd(breadcrumbs: Breadcrumb[]): any {
		return {
			"@context": "http://schema.org",
			"@type": "BreadcrumbList",
			"itemListElement": breadcrumbs.map((crumb, index) => ({
				"@type": "ListItem",
				"position": index,
				"item": {
					"@id": "https://shop.meilenwoelfe.de" + crumb.link,
					"name": crumb.label,
				}
			}))
		};
	}

	getJsonLd$(route: ActivatedRoute): Observable<any> {
		return this.buildBreadCrumb(route).pipe(
			map(breadcrumbs => this.toJsonLd(breadcrumbs))
		);
	}
}
