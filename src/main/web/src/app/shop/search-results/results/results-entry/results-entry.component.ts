import {Component, Input, OnInit} from "@angular/core";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {ShopItem} from "../../../../shared/model/shop-item";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"]
})
export class ResultsEntryComponent implements OnInit {
	@Input() result: ShopItem;

	constructor(private eventUtilService: EventUtilityService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	resultIsMerch(result: ShopItem) {
		return this.eventUtilService.isMerchandise(result);
	}

	showResult(result: ShopItem) {
		this.navigationService.navigateToItemWithId(this.eventUtilService.getShopItemType(result), result.id);
	}

}
