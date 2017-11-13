import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {ModifyMerchStockService} from "./modify-merch-stock.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map} from "rxjs/operators";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"],
	providers: [ModifyMerchStockService]
})
export class ModifyMerchStockComponent implements OnInit, OnDestroy{
	@Input() merchTitle: string;

	merchStockSubject: BehaviorSubject<MerchStock[]> = new BehaviorSubject([]);
	merchStock$ = this.merchStockSubject
		.asObservable()
		.pipe(
			map(merchStock => [...merchStock].map(stock => ({
				id: stock["id"],
				size: stock.size,
				color: Object.assign({}, stock.color),
				amount: stock.amount,
			})))
		);

	@Output() stockChange = new EventEmitter();


	subscription;
	constructor(public modifyMerchStockService: ModifyMerchStockService) {
		this.modifyMerchStockService.init(this.merchStockSubject);
		this.subscription = this.modifyMerchStockService.dataSubject$
			.subscribe(value => this.stockChange.emit(value))
	}

	@Input()
	set stock(value) {
		this.merchStockSubject.next(value ? value : []);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

}
