import {Component, OnDestroy, OnInit} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {OrderOverviewService} from "./order-overview.service";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"],
	providers: [OrderOverviewService]
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
	showOptions = true;
	mobile = false;

	subscriptions = [];

	constructor(private windowService: WindowService,
				public orderOverviewService: OrderOverviewService) {
		this.subscriptions.push(this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions)));
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	/**
	 * Updates the columns and way the options are presented depending on the given width/height object
	 * @param {Dimension} dimension the current window dimensions
	 */
	onResize(dimension: Dimension) {
		let mobile = dimension.width < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}


}
