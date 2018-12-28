import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ShoppingCartOption} from "../../../../../shared/model/shopping-cart-item";

@Component({
	selector: "memo-cart-tour-participant",
	templateUrl: "./cart-tour-participant.component.html",
	styleUrls: ["./cart-tour-participant.component.scss"]
})
export class CartTourParticipantComponent implements OnInit {
	@Input() index: number;
	@Input() name: string;

	@Input() option: ShoppingCartOption = {isDriver: false, needsTicket: false, color: undefined, size: ""};
	@Output() optionChange: EventEmitter<ShoppingCartOption> = new EventEmitter<ShoppingCartOption>();

	@Input() set isDriver(isDriver: boolean) {
		this.option.isDriver = isDriver;
	}

	@Input() set needsTicket(needsTicket: boolean) {
		this.option.needsTicket = needsTicket;
	}

	@Output() onRemove: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor() {
	}

	ngOnInit() {
	}

}
