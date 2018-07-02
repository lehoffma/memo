import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {Address} from "../../../model/address";
import {AddressService} from "../../../services/api/address.service";
import {combineLatest, Observable} from "rxjs";

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
