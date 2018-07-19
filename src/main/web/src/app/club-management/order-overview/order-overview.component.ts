import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {OrderOverviewService} from "./order-overview.service";
import {MatPaginator} from "@angular/material";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Order} from "../../shared/model/order";

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
	sortingOptions: SortingOption<any>[] = orderSortingOptions;


	@ViewChild(MatPaginator) paginator: MatPaginator;
	constructor(private windowService: WindowService,
				public orderOverviewService: OrderOverviewService) {
		this.subscriptions.push(this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions)));
	}

	ngOnInit() {
		this.orderOverviewService.dataSource.paginator = this.paginator;
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




export const orderSortingOptions: SortingOption<Order>[] = [
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "timeStamp")
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "timeStamp")
	)
];
