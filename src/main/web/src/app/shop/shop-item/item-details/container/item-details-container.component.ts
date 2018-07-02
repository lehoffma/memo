import {Component, Input, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../../shared/model/event";
import {LogInService} from "../../../../shared/services/api/login.service";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {filter, map, mergeMap, take} from "rxjs/operators";
import {ResponsibilityService} from "../../../shared/services/responsibility.service";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {User} from "../../../../shared/model/user";
import {OrderService} from "../../../../shared/services/api/order.service";
import {Order} from "../../../../shared/model/order";
import {OrderedItem} from "../../../../shared/model/ordered-item";
import {OrderStatus} from "../../../../shared/model/order-status";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {Sort} from "../../../../shared/model/api/sort";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "./item-details-container.component.html",
	styleUrls: ["./item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	event$: BehaviorSubject<Event> = new BehaviorSubject<Event>(null);
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
	//todo as api response
	orderedItemDetails$: Observable<Order> = combineLatest(
		this.loginService.currentUser$,
		this.event$
	)
		.pipe(
			filter(([user, event]) => user !== null && event !== null),
			//check if there is an order for this item
			mergeMap(([user, event]) => this.orderService.getByUserId(user.id, PageRequest.first(), Sort.none())
				.pipe(
					map(it => it.content),
					map(orders =>
						orders.find(order => order.items.some(
							(item: OrderedItem) => item.item.id === event.id
								&& item.status !== OrderStatus.CANCELLED
							)
							&& order.user === user.id
						)
					)
				)
			),
			filter(order => !!order)
		);
	linkToOrder$: Observable<string> = this.orderedItemDetails$
		.pipe(
			map(order => "/orders/" + order.id)
		);
	showConcludeEventHeader$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			mergeMap(user => this.checkResponsibility(user))
		);

	constructor(private matDialog: MatDialog,
				private orderService: OrderService,
				private responsibilityService: ResponsibilityService,
				private concludeEventService: ConcludeEventService,
				private loginService: LogInService) {
	}

	get event() {
		return this.event$.getValue();
	}

	@Input() set event(event: Event) {
		this.event$.next(event);
	}

	ngOnInit() {
	}

	showDetailedImage(selectedImage: string) {
		this.images$.pipe(take(1))
			.subscribe(images => {
				this.matDialog.open(ItemImagePopupComponent, {
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
