import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Event} from "../../shop/shared/model/event";
import {NavigationService} from "../../shared/services/navigation.service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {LogInService} from "../../shared/services/api/login.service";
import {Permission, UserPermissions} from "../../shared/model/permission";
import {Discount} from "../../shared/price-renderer/discount";
import {DiscountService} from "../../shop/shared/services/discount.service";
import {map} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {Observable} from "rxjs/Observable";
import {distanceInWordsStrict} from "date-fns";
import * as deLocale from "date-fns/locale/de";

@Component({
	selector: "memo-category-preview",
	templateUrl: "./category-preview.component.html",
	styleUrls: ["./category-preview.component.scss"]
})
export class CategoryPreviewComponent implements OnInit, OnDestroy {
	@Input() events$: Observable<Event[]>;
	@Input() route: string;
	@Input() itemType: ShopItemType;

	showDate = false;
	noElementsText = "";
	addShopItemText = "";
	createLink = "";
	discounts: {
		[id: number]: Observable<Discount[]>
	} = {};

	userCanCreateEvent: Observable<boolean> = this.loginService
		.currentUser$
		.pipe(
			map(user => {
				if (user === null) {
					return false;
				}
				const permissions = user.userPermissions();
				const permissionKey: keyof UserPermissions = EventUtilityService
					.shopItemSwitch<keyof UserPermissions>(this.itemType, {
						tours: () => "tour",
						partys: () => "party",
						merch: () => "merch"
					});

				return permissions[permissionKey] >= Permission.create;
			})
		);

	subscriptions = [];

	constructor(public navigationService: NavigationService,
				public discountService: DiscountService,
				public loginService: LogInService) {

	}

	ngOnInit(): void {
		this.showDate = this.itemType !== ShopItemType.merch;
		this.noElementsText = EventUtilityService.shopItemSwitch<string>(this.itemType, {
			tours: () => "Es gibt keine bevorstehenden Touren!",
			merch: () => "Keine Merchandise-Artikel vorhanden!",
			partys: () => "Es gibt keine bevorstehenden Veranstaltungen!"
		});
		this.addShopItemText = EventUtilityService.shopItemSwitch(this.itemType, {
			tours: () => "Tour erstellen",
			merch: () => "Artikel erstellen",
			partys: () => "Veranstaltung erstellen"
		});
		this.createLink = "create/" + this.itemType + "/";

		this.subscriptions.push(
			combineLatest(this.events$, this.loginService.accountObservable)
				.subscribe(([events, userId]) => {
					this.discounts = {};
					events.forEach(event => {
						if (this.loginService.isLoggedIn()) {
							this.discounts[event.id] = this.discountService.getEventDiscounts(event.id, userId);
						}
						else {
							this.discounts[event.id] = this.discountService.getEventDiscounts(event.id)
						}
					})
				})
		)
	}

	distanceInWords(date: Date){
		return distanceInWordsStrict(new Date(), date, {addSuffix: true, locale: deLocale});
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	showDetails(event: Event) {
		this.navigationService.navigateByUrl(`${this.route}/${event.id}`);
	}
}
