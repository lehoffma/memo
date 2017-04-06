import {Component, Input, OnInit} from "@angular/core";
import {SelectionModel} from "../../selection/object-details-selection.component";
import {Event} from "../../../shared/model/event";
import {Merchandise} from "../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventService} from "../../../../shared/services/event.service";
import {EventOverviewKey} from "./event-overview-key";


@Component({
	selector: "memo-item-details-overview",
	templateUrl: "./item-details-overview.component.html",
	styleUrls: ["./item-details-overview.component.scss"]
})
export class ItemDetailsOverviewComponent implements OnInit {
	@Input() event: Event = new Event();
	@Input() overviewKeys: EventOverviewKey[] = [];
	model = {
		options: {
			color: undefined,
			size: undefined
		},
		amount: undefined
	};

	private _colorSelection = [];
	private _sizeSelection = [];

	get colorSelection(): SelectionModel[] {
		return this._colorSelection;
	}

	get sizeSelection(): SelectionModel[] {
		return this._sizeSelection;
	}

	ngOnChanges() {
		if (this.event && this.isMerch) {
			this._colorSelection = (<Merchandise>this.event).colorSelections;
			this._sizeSelection = (<Merchandise>this.event).clothesSizeSelections;
		}
	}

	constructor(private eventService: EventService,
				private shoppingCartService: ShoppingCartService) {
	}

	ngOnInit() {
		if (this.isMerch && this.colorSelection.length > 0 && this.sizeSelection.length > 0) {
			console.log(this.colorSelection);
			this.model.options.color = this.colorSelection[0].value;
			this.model.options.size = this.sizeSelection[0].value;
		}
	}

	get isMerch() {
		return this.eventService.isMerchandise(this.event);
	}

	/**
	 * Fügt das aktuelle Item dem Warenkorb hinzu.
	 */
	addToCart(item: Event) {
		this.shoppingCartService.addItem(this.eventService.getEventType(item), {
			id: item.id,
			options: this.model.options,
			amount: this.model.amount
		});
		this.model.amount = undefined;
	}

}
