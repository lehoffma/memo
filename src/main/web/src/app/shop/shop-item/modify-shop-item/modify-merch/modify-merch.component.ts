import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {ModifyItemEvent} from "../modify-item-event";
import {Permission} from "../../../../shared/model/permission";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {createMerch, Merchandise} from "../../../shared/model/merchandise";
import {StockService} from "../../../../shared/services/api/stock.service";
import {MerchStock} from "../../../shared/model/merch-stock";
import {ModifyItemService} from "../modify-item.service";
import {Sort} from "../../../../shared/model/api/sort";
import {setProperties} from "../../../../shared/model/util/base-object";
import {PaymentMethod} from "../../../checkout/payment/payment-method";
import {paymentMethodLimitationValidator} from "../shared/payment-method-configuration/payment-method-limitation.validator";
import {paymentConfig} from "../../../shared/model/event";
import {numberLimitToString} from "../shared/payment-method-configuration/payment-method-limit-util";
import {WindowService} from "../../../../shared/services/window.service";

@Component({
	selector: "memo-modify-merch",
	templateUrl: "./modify-merch.component.html",
	styleUrls: ["./modify-merch.component.scss"]
})
export class ModifyMerchComponent implements OnInit {
	formGroup: FormGroup;
	_previousStock: MerchStock[] = [];
	@Input() mode: ModifyType;
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();
	ModifyType = ModifyType;

	isDesktop$ = this.windowService.hasMinDimensions(800);

	constructor(private location: Location,
				public modifyItemService: ModifyItemService,
				private stockService: StockService,
				private windowService: WindowService,
				private formBuilder: FormBuilder) {
		this.formGroup = this.formBuilder.group({
			"event-data": this.formBuilder.group({
				"title": ["", {
					validators: [Validators.required]
				}],
				"description": ["", {
					validators: [Validators.required]
				}],
				"price": [0, {
					validators: [Validators.required, Validators.pattern(/^[\d]+((\.|\,)[\d]{1,2})?$/)]
				}],
				"stock": [[], {validators: [Validators.required]}],
				"material": ["", {
					validators: [Validators.required]
				}]
			}),
			"images": this.formBuilder.group({
				"imagePaths": [[], {validators: []}],
				"imagesToUpload": [[], {validators: []}]
			}),
			"permissions": this.formBuilder.group({
				"expectedReadRole": [Permission.none, {
					validators: [Validators.required]
				}],
				"expectedWriteRole": [Permission.none, {
					validators: [Validators.required]
				}],
				"expectedCheckInRole": [Permission.none, {
					validators: [Validators.required]
				}]
			}),
			"payment-config": this.formBuilder.group({
				"limit": "Kein Limit",
				"methods": this.formBuilder.group({
					[PaymentMethod.CASH]: true,
					[PaymentMethod.DEBIT]: true,
					[PaymentMethod.TRANSFER]: true
				})
			}, {
				validators: [paymentMethodLimitationValidator()]
			}),
			"responsible-users": [[], {validators: [Validators.required]}]
		})
	}

	_previousValue: Merchandise;

	get previousValue() {
		return this._previousValue;
	}

	@Input() set previousValue(previousValue: Merchandise) {
		this._previousValue = previousValue;

		if (!previousValue) {
			return;
		}

		this.formGroup.get("event-data").get("title").patchValue(previousValue.title);
		this.formGroup.get("event-data").get("description").patchValue(previousValue.description);
		this.formGroup.get("event-data").get("price").patchValue(previousValue.price);
		this.formGroup.get("event-data").get("material").patchValue(previousValue.material);
		this.formGroup.get("images").get("imagePaths").patchValue(previousValue.images);
		this.formGroup.get("permissions").get("expectedReadRole").patchValue(previousValue.expectedReadRole);
		this.formGroup.get("permissions").get("expectedWriteRole").patchValue(previousValue.expectedWriteRole);
		this.formGroup.get("permissions").get("expectedCheckInRole").patchValue(previousValue.expectedCheckInRole);
		this.stockService.getByEventId(previousValue.id, Sort.none())
			.subscribe(stock => this._previousStock = stock);
		let config= paymentConfig(previousValue);

		this.formGroup.get("payment-config").get("limit").patchValue(numberLimitToString(config.limit));
		this.formGroup.get("payment-config").get("methods").patchValue(config.methods);
	}

	ngOnInit() {
	}

	/**
	 * Go back to where the user came from
	 */
	cancel() {
		this.location.back();
	}


	/**
	 * Emit submit event
	 */
	submitModifiedObject() {
		const merch = setProperties(createMerch(), {
			title: this.formGroup.get("event-data").get("title").value,
			description: this.formGroup.get("event-data").get("description").value,
			price: this.formGroup.get("event-data").get("price").value,
			material: this.formGroup.get("event-data").get("material").value,
			expectedReadRole: this.formGroup.get("permissions").get("expectedReadRole").value,
			expectedWriteRole: this.formGroup.get("permissions").get("expectedWriteRole").value,
			expectedCheckInRole: this.formGroup.get("permissions").get("expectedCheckInRole").value,
			paymentConfig: this.formGroup.get("payment-config").value,
			author: this.formGroup.get("responsible-users").value
		} as any);
		//todo emit merch object + images + stock
		this.onSubmit.emit({
			item: merch,
			images: this.formGroup.get("images").value,
			stock: this.formGroup.get("event-data").get("stock").value
		});
	}
}
