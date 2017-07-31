import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Address} from "../../../shared/model/address";
import {Router} from "@angular/router";
import {AddressService} from "../../../shared/services/address.service";

@Component({
	selector: "memo-address-selection",
	templateUrl: "./address-selection.component.html",
	styleUrls: ["./address-selection.component.scss"]
})
export class AddressSelectionComponent implements OnInit{

	//todo edit/remove functionality
	// => mobile: long press opens menu?
	// => desktop: show options icon, which opens menu
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

	_selectedAddress: Address;

	get selectedAddress() {
		return this._selectedAddress;
	}

	set selectedAddress(address: Address) {
		this._selectedAddress = address;
		this.addressChange.emit(address);
	}

	@Output() addressChange = new EventEmitter<Address>();

	constructor(private router: Router,
				private addressService: AddressService) {
	}

	ngOnInit() {
	}

	/**
	 *
	 */
	redirectToAddNewAddress() {
		this.addressService.redirectUrl = this.router.url;
	}
}
