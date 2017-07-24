import {Component, Input, OnInit} from "@angular/core";
import {Address} from "../../../shared/model/address";

@Component({
	selector: "memo-address-selection",
	templateUrl: "./address-selection.component.html",
	styleUrls: ["./address-selection.component.scss"]
})
export class AddressSelectionComponent implements OnInit{

	//todo emit event when selection changes
	//todo edit/remove functionality
	//todo "add address" button
	private _addresses: Address[] = [];

	@Input() set addresses(addresses: Address[]){
		this._addresses = addresses;
		if(addresses && addresses.length > 0){
			this.selectedAddress = addresses[0];
		}
	}
	get addresses():Address[]{
		return this._addresses;
	}

	selectedAddress: Address;

	constructor() {
	}

	ngOnInit() {
	}

}
