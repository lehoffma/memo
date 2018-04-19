import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/utility/expandable-table/expandable-table-cell.component";
import {Address} from "../../../../shared/model/address";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Observable} from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";

@Component({
	selector: "td [addressTableCell]",
	template: `
		<table *ngIf="addresses$ | async as addresses">
			<tbody *ngFor="let address of addresses; let i = index" [style.marginBottom]="'10px'">
			<th>Addresse {{i + 1}}</th>
			<tr>{{address.name}}</tr>
			<tr>{{address.street}} {{address.streetNr}}</tr>
			<tr>{{address.zip}}</tr>
			<tr>{{address.city}}</tr>
			<tr>{{address.country}}</tr>

			</tbody>
		</table>
	`
})

export class AddressTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: number[];
	addresses$: Observable<Address[]>;

	constructor(private addressService: AddressService) {
	}

	ngOnInit() {
		this.addresses$ = combineLatest(...this.data.map(id => this.addressService.getById(id)));
	}

}
