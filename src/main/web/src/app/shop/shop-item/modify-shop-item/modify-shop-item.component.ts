import {Component, OnDestroy, OnInit} from "@angular/core";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ModifyType} from "./modify-type";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {ModifyItemService} from "./modify-item.service";
import {Observable} from "rxjs/Observable";
import {ModifyItemEvent} from "./modify-item-event";

@Component({
	selector: "memo-modify-shop-item",
	templateUrl: "./modify-shop-item.component.html",
	styleUrls: ["./modify-shop-item.component.scss"]
})
export class ModifyShopItemComponent implements OnInit, OnDestroy {
	ModifyType = ModifyType;
	ItemType = ShopItemType;

	// //either add or edit
	// mode: ModifyType;
	//
	// //either merch, tour, party, user or entry
	// itemType: ShopItemType;
	// eventType: (ShopItemType);
	//
	// //wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	// //ansonsten wird das übergebene Objekt editiert
	// idOfObjectToModify: number;
	// eventId: number = -1;
	//
	// previousValue: ShopItem;
	// model: any = {};

	constructor(public modifyItemService: ModifyItemService,
				private location: Location,
				private activatedRoute: ActivatedRoute) {
		Observable.combineLatest(
			this.activatedRoute.params.first(),
			this.activatedRoute.queryParamMap.first()
		)
			.subscribe(([params, queryParamMap]) => {
				this.modifyItemService.readParams(params);
				this.modifyItemService.readQueryParams(queryParamMap);
				this.modifyItemService.init();
			});
	}

	/**
	 *
	 */
	ngOnInit() {
		// this.modifyItemService.init();
	}

	ngOnDestroy(): void {
		this.modifyItemService.reset();
	}

	/**
	 * Cancel callback
	 */
	cancel() {
		this.modifyItemService.reset();
		this.location.back();
	}

	/**
	 * Submit callback
	 */
	submitModifiedObject(result: ModifyItemEvent) {
		this.modifyItemService.submitModifiedEvent(result);
	}

	watchForAddressModification(event: any) {
		this.modifyItemService.watchForAddressModification(event);
	}
}
