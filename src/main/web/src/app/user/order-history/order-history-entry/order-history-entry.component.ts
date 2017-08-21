import {Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../shared/model/order";

@Component({
	selector: 'memo-order-history-entry',
	templateUrl: './order-history-entry.component.html',
	styleUrls: ["./order-history-entry.component.scss"]
})

export class OrderHistoryEntryComponent implements OnInit {
	@Input() orderEntry: Order;

	constructor() {
	}

	ngOnInit() {
	}
}
