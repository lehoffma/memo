import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable, of} from "rxjs";
import {Discount} from "../../../shared/renderers/price-renderer/discount";
import {ActivatedRoute} from "@angular/router";
import {switchMap} from "rxjs/operators";
import {DiscountService} from "../../../shop/shared/services/discount.service";

@Component({
	selector: "memo-discount-form",
	templateUrl: "./discount-form.component.html",
	styleUrls: ["./discount-form.component.scss"]
})
export class DiscountFormComponent implements OnInit {

	formGroup: FormGroup = this.fb.group({
		amount: this.fb.control(0, {validators: [Validators.min(0)]}),
		isPercentage: this.fb.control(false),
		linkUrl: this.fb.control(""),
		linkText: this.fb.control(""),
		reason: this.fb.control("", {validators: [Validators.required]}),
		limitPerUserAndItem: this.fb.control(-1, {validators: [Validators.required, Validators.min(-1)]}),
		conditions: this.fb.array([])
	});

	loading: boolean;
	error: any;

	previousValue$: Observable<Discount> = this.activatedRoute.paramMap.pipe(
		switchMap(map => map.has("id")
			? this.discountService.getById(+map.get("id"))
			: of(null)
		)
	);

	constructor(private fb: FormBuilder,
				private discountService: DiscountService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
	}

	submitModifiedObject() {

	}

	cancel() {

	}
}
