import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {ModifyMerchStockService} from "./modify-merch-stock.service";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import {filter, map, take} from "rxjs/operators";
import {timer} from "rxjs/observable/timer";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"],
	providers: [ModifyMerchStockService, {
		provide: NG_VALUE_ACCESSOR,
		useExisting: ModifyMerchStockComponent,
		multi: true
	}],
})
export class ModifyMerchStockComponent implements OnInit, OnDestroy, ControlValueAccessor {
	@Input() formControl: FormControl;

	_previousValue: MerchStock[];
	@Input() set previousValue(previousValue: MerchStock[]) {
		if (previousValue === undefined) {
			return;
		}
		this._previousValue = previousValue;
		this.modifyMerchStockService.setValue(previousValue);
	}

	get previousValue() {
		return this._previousValue;
	}

	@Input() merchTitle: string;

	_onChange;

	subscription;

	constructor(public modifyMerchStockService: ModifyMerchStockService) {
	}


	ngOnInit() {
		this.subscription = this.modifyMerchStockService.dataSubject$
			.subscribe(value => this.onChange(value));
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}


	onChange(merchStock: MerchStock[]) {
		timer(0, 500)
			.pipe(
				//hack: sometimes _onChange is not yet initialized when we're attempting to set the value
				filter(it => this._onChange !== null),
				take(1),
				map(it => merchStock)
			)
			.subscribe(values => {
				this._onChange(values);
			});
	}

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: any): void {
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		}
		else {
			this.formControl.enable();
		}
	}

	writeValue(obj: MerchStock[]): void {
		console.log(obj);
		this.formControl.setValue(obj);
	}

}
