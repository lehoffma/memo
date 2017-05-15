import {Component, Input, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventType} from "../../../shared/model/event-type";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit {
	@Input() event;
	amountOptions = [0, 1, 2, 3]


	constructor(private shoppingCartService: ShoppingCartService, private eventUtilityService: EventUtilityService) {
	}

	ngOnInit() {
	}

	updateEventAmount() {
		this.shoppingCartService.content.first().subscribe(content => {
			if (this.eventUtilityService.isMerchandise(this.event.event)) {
				let merch = content.merch.find(merch => merch.id === this.event.event.id)
				if (merch) {
					let diff: number;
					diff = this.event.amount-merch.amount;
					if (diff > 0) {
						this.shoppingCartService.addItem(EventType.merch, {
							id: this.event.event.id,
							amount: diff,
							options: this.event.options
						})
					}
					if (diff < 0) {
						for(let i=diff; i<0; i++){
							this.shoppingCartService.deleteItem(EventType.merch, this.event.event.id)
						}


					}
				}
			}
		})
	}
}

