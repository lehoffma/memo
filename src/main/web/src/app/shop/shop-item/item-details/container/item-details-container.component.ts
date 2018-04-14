import {Component, Input, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../../shared/model/event";
import {EventOverviewKey} from "./overview/event-overview-key";
import {LogInService} from "../../../../shared/services/api/login.service";
import {of} from "rxjs/observable/of";
import {map, mergeMap, take} from "rxjs/operators";
import {ResponsibilityService} from "../../../shared/services/responsibility.service";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {User} from "../../../../shared/model/user";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "./item-details-container.component.html",
	styleUrls: ["./item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	event$: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);

	@Input() set event(event: Event) {
		this.event$.next(event);
	}

	get event() {
		return this.event$.getValue();
	}

	images$: Observable<string[]> = this.event$
		.pipe(
			map(event => {
				if (!event) {
					return [];
				}
				if (event.groupPicture) {
					return [...event.images, event.groupPicture];
				}
				else {
					return [...event.images];
				}
			})
		);

	showConcludeEventHeader$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			mergeMap(user => this.checkResponsibility(user))
		);

	@Input() overviewKeys: Observable<EventOverviewKey[]> = of([]);

	constructor(private mdDialog: MatDialog,
				private responsibilityService: ResponsibilityService,
				private concludeEventService: ConcludeEventService,
				private loginService: LogInService) {
	}

	ngOnInit() {
	}

	showDetailedImage(selectedImage: string) {
		this.images$.pipe(take(1))
			.subscribe(images => {
				this.mdDialog.open(ItemImagePopupComponent, {
					data: {
						images: images,
						imagePath: selectedImage
					}
				})
			})
	}

	/**
	 *
	 * @param {User} user
	 * @returns {Observable<boolean>}
	 */
	checkResponsibility(user: User): Observable<boolean> {
		if (user !== null && this.event !== null) {
			return this.concludeEventService.isConcludeBannerShown(this.event.id)
				.pipe(
					mergeMap(bannerIsShown => this.responsibilityService
						.isResponsible(this.event.id, user.id)
						.pipe(
							map(isResponsible => bannerIsShown && isResponsible)
						)
					)
				);
		}
		return of(false);
	}
}
