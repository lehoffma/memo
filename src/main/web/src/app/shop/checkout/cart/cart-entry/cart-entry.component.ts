import {Component, Input, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventType} from "../../../shared/model/event-type";
import {ShoppingCartContent} from "../../../../shared/model/shopping-cart-content";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit {
	@Input() event;
	amountOptions = []


	constructor(private shoppingCartService: ShoppingCartService, private eventUtilityService: EventUtilityService) {

	}

	ngOnInit() {
		let maxAmount: number;
		if(this.eventUtilityService.isMerchandise(this.event.event)){
			maxAmount=this.event.event.getAmountOf(this.event.options.color, this.event.options.size)
		}else {
			maxAmount=this.event.event.capacity;
		}
		for(let i=0;i<maxAmount;i++){
			this.amountOptions.push(i);
		}
	}

	resultIsMerch(result: Event) {
		return this.eventUtilityService.isMerchandise(result);
	}


	private updateAmount(content: ShoppingCartContent, eventType: EventType){
		let item = content[eventType].find(item => item.id === this.event.event.id)
		if (item) {
			let diff: number;
			diff = this.event.amount-item.amount;
			if (diff > 0) {
				this.shoppingCartService.addItem(eventType, {
					id: this.event.event.id,
					amount: diff,
					options: this.event.options
				})
			}
			if (diff < 0) {
				for(let i=diff; i<0; i++){
					this.shoppingCartService.deleteItem(eventType, this.event.event.id)
				}


			}

		}
	}
	updateEventAmount() {
		this.shoppingCartService.content.first().subscribe(content => {
				this.updateAmount(content, this.eventUtilityService.getEventType(this.event.event));
		})
	}
}

