import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from "@angular/core";
import {ShopEvent} from "../../../shop/shared/model/event";

@Component({
	selector: "memo-category-container",
	templateUrl: "./category-container.component.html",
	styleUrls: ["./category-container.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryContainerComponent implements OnInit {
	@Input() header: string;
	@Input() explanation: string;

	@Input() itemsHeader: string;
	@Input() moreItemsLink: string;
	@Input() items: ShopEvent[] = [];

	@Input() direction: "left-to-right" | "right-to-left" = "left-to-right";

	@Input() emptyStateIcon: string;
	@Input() emptyStateHeadline: string;
	@Input() emptyStateSubtitle: string;

	@HostBinding("class.is-reverse")
	get isReverse() {
		return this.direction === "right-to-left";
	}

	constructor() {
	}

	ngOnInit() {
	}

}
