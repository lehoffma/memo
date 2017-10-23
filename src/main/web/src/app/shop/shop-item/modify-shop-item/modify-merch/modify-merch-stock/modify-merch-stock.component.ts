import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {BehaviorSubject} from "rxjs/Rx";
import {ModifyMerchStockService} from "./modify-merch-stock.service";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"],
	providers: [ModifyMerchStockService]
})
export class ModifyMerchStockComponent implements OnInit {
	@Input() merchTitle: string;

	merchStockSubject: BehaviorSubject<MerchStock[]> = new BehaviorSubject([]);
	merchStock$ = this.merchStockSubject
		.asObservable()
		.map(merchStock => [...merchStock].map(stock => ({
			id: stock["id"],
			size: stock.size,
			color: Object.assign({}, stock.color),
			amount: stock.amount,
		})));

	@Output() stockChange = new EventEmitter();


	constructor(public modifyMerchStockService: ModifyMerchStockService) {
		this.modifyMerchStockService.init(this.merchStockSubject);
		this.modifyMerchStockService.dataSubject$.subscribe(value => this.stockChange.emit(value))
	}

	@Input()
	set stock(value) {
		this.merchStockSubject.next(value ? value : []);
	}

	ngOnInit() {
	}

}
