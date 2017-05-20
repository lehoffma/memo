import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";
import {Address} from "../../../../shared/model/address";
import {AddressService} from "../../../../shared/services/address.service";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "td [addressTableCell]",
	template: `
		<span *ngIf="observableAddress | async as address">
			{{address.name}}
		</span>
	`
})

export class AddressTableCellComponent implements OnInit, ExpandableTableCellComponent {
	//todo toString() methode für addressen oder lieber direkt google maps aufrufen? (könnte ein wenig datenvolumen wegballern)
	@Input() data: number[];
	observableAddress: Observable<Address>;

	constructor(private addressService: AddressService) {
	}

	ngOnInit() {
		//todo multiple address support
		console.log(this.data);
		this.observableAddress = this.addressService.getById(this.data[0]);
	}

}
