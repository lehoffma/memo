import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../shop/shared/model/event";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";
import {LogInService} from "../../shared/services/api/login.service";
import {Permission, UserPermissions} from "../../shared/model/permission";

@Component({
	selector: "memo-category-preview",
	templateUrl: "./category-preview.component.html",
	styleUrls: ["./category-preview.component.scss"]
})
export class CategoryPreviewComponent implements OnInit {
	@Input() events$: Observable<Event[]>;
	@Input() route: string;
	@Input() itemType: ShopItemType;

	showDate = false;
	noElementsText = "";
	addShopItemText = "";
	createLink = "";

	userCanCreateEvent: Observable<boolean> = this.loginService
		.currentUser$
		.map(user => {
			if (user === null) {
				return false;
			}
			const permissions = user.userPermissions;
			const permissionKey: keyof UserPermissions = EventUtilityService
				.handleOptionalShopType<keyof UserPermissions>(this.itemType, {
					tours: () => "tour",
					partys: () => "party",
					merch: () => "merch"
				});

			return permissions[permissionKey] >= Permission.create;
		});

	constructor(public navigationService: NavigationService,
				public loginService: LogInService) {

	}

	ngOnInit(): void {
		this.showDate = this.itemType !== ShopItemType.merch;
		this.noElementsText = EventUtilityService.handleOptionalShopType<string>(this.itemType, {
			tours: () => "Es gibt keine bevorstehenden Touren!",
			merch: () => "Keine Merchandise-Artikel vorhanden!",
			partys: () => "Es gibt keine bevorstehenden Veranstaltungen!"
		});
		this.addShopItemText = EventUtilityService.handleOptionalShopType(this.itemType, {
			tours: () => "Tour erstellen",
			merch: () => "Artikel erstellen",
			partys: () => "Veranstaltung erstellen"
		});
		this.createLink = "/" + this.itemType + "/create";
	}

	showDetails(event: Event) {
		this.navigationService.navigateByUrl(`${this.route}/${event.id}`);
	}
}
