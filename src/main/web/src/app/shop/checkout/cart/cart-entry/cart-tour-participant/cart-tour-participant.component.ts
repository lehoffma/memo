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
	@Input() option: ShoppingCartOption;
	@Output() optionChange: EventEmitter<ShoppingCartOption> = new EventEmitter<ShoppingCartOption>();
	@Output() onRemove: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor() {
	}

	ngOnInit() {
	}

}
