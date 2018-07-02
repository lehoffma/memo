import {Component, OnDestroy, OnInit} from "@angular/core";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ModifyType} from "./modify-type";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {ModifyItemService} from "./modify-item.service";
import {ModifyItemEvent} from "./modify-item-event";
import {combineLatest} from "rxjs";
import {first} from "rxjs/operators";

@Component({
	selector: "memo-modify-shop-item",
	templateUrl: "./modify-shop-item.component.html",
	styleUrls: ["./modify-shop-item.component.scss"]
})
export class ModifyShopItemComponent implements OnInit, OnDestroy {
	ModifyType = ModifyType;
	ItemType = ShopItemType;

	constructor(public modifyItemService: ModifyItemService,
				private location: Location,
				private activatedRoute: ActivatedRoute) {
		combineLatest(
			this.activatedRoute.params.pipe(first()),
			this.activatedRoute.queryParamMap.pipe(first())
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
}
