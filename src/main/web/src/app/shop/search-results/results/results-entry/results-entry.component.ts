import {Component, Input, OnInit} from "@angular/core";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {Event} from "../../../shared/model/event";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"]
})
export class ResultsEntryComponent implements OnInit {
	@Input() result: Event;

	constructor(private eventUtilService: EventUtilityService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}

	resultIsMerch(result: Event) {
		return this.eventUtilService.isMerchandise(result);
	}

	showResult(result: Event) {
		this.navigationService.navigateToItemWithId(this.eventUtilService.getShopItemType(result), result.id);
	}

}
