import {Injectable, OnDestroy} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OrderStatusList} from "../../shared/model/order-status";
import {PaymentMethod, paymentMethodList} from "../../shop/checkout/payment/payment-method";
import {first, map, mergeMap} from "rxjs/operators";
import {ParamMap, Params, Router} from "@angular/router";
import {isValid, parse} from "date-fns";
import {NavigationService} from "../../shared/services/navigation.service";
import {QueryParameterService} from "../../shared/services/query-parameter.service";
import {Observable, of} from "rxjs";
import {getAllQueryValues} from "../../shared/model/util/url-util";

interface OrderOptionsFormValue {
	from: Date;
	to: Date;
	eventIds: number[];
	userIds: number[];
	status: { [status: string]: boolean };
	method: { [method: string]: boolean };
}

@Injectable()
export class OrderOptionsService implements OnDestroy {

	public formGroup: FormGroup;

	loading = false;

	subscriptions = [];

	constructor(private formBuilder: FormBuilder,
				private queryParameterService: QueryParameterService,
				private router: Router,
				private navigationService: NavigationService) {
		this.formGroup = this.formBuilder.group({
			"from": [undefined],
			"to": [undefined],
			"eventIds": [[]],
			"userIds": [[]],
			"status": this.formBuilder.group(OrderStatusList.reduce((acc, status) => ({...acc, [status]: true}), {})),
			"method": this.formBuilder.group(paymentMethodList().reduce((acc, status) => ({...acc, [status]: true}), {})),
		});

		this.subscriptions.push(
			this.formGroup.valueChanges.subscribe(it => {
				this.updateQueryParams();
			}),
			this.initQueryParamMap().subscribe(() => null)
		);
	}


	/**
	 *
	 * @param object
	 * @param keys
	 */
	readBinaryValuesFromQueryParams(object: {
		[key: string]: boolean
	}, keys: string[]) {
		Object.keys(object)
			.filter(key => keys.indexOf(key) === -1)
			.forEach(key => object[key] = false);
		keys.forEach(key => object[key] = true);
	}

	/**
	 *
	 */
	initQueryParamMap() {
		return this.navigationService.queryParamMap$
			.pipe(
				first(),
				mergeMap(queryParamMap => {
					if (queryParamMap.keys.length === 0) {
						return this.updateQueryParams();
					}
					this.initFromParamMap(queryParamMap);
					return of(queryParamMap);
				})
			)
	}


	/**
	 *
	 * @param {ParamMap} queryParamMap
	 */
	initFromParamMap(queryParamMap: ParamMap) {
		const value: OrderOptionsFormValue = this.formGroup.value;

		if (queryParamMap.has("minTimeStamp")) {
			const from = parse(queryParamMap.get("minTimeStamp"));
			value.from = from && isValid(from) ? from : null;
		}
		if (queryParamMap.has("maxTimeStamp")) {
			const to = parse(queryParamMap.get("maxTimeStamp"));
			value.to = to && isValid(to) ? to : null;
		}
		if (queryParamMap.has("eventIds")) {
			value.eventIds = getAllQueryValues(queryParamMap, "eventIds").map(it => +it)
		}
		if (queryParamMap.has("userIds")) {
			value.userIds = getAllQueryValues(queryParamMap, "userIds").map(it => +it);
		}

		this.readBinaryValuesFromQueryParams(value.status, getAllQueryValues(queryParamMap, "status"));
		this.readBinaryValuesFromQueryParams(value.method, getAllQueryValues(queryParamMap, "method"));

		this.formGroup.patchValue(value);
	}

	/**
	 *
	 */
	updateQueryParams(): Observable<any> {
		const params: Params = {};
		const formValue: OrderOptionsFormValue = this.formGroup.value;

		params["status"] = Object.keys(formValue.status)
			.filter(key => formValue.status[key])
			.join(",");
		params["method"] = Object.keys(formValue.method)
			.filter(key => formValue.method[key])
			.join(",");

		params["eventIds"] = formValue.eventIds;
		params["userIds"] = formValue.userIds;

		params["minTimeStamp"] = (!formValue.from || !isValid(formValue.from)) ? "" : formValue.from.toISOString();
		params["maxTimeStamp"] = (!formValue.to || !isValid(formValue.to)) ? "" : formValue.to.toISOString();

		const update$ = this.navigationService.queryParamMap$
			.pipe(
				first(),
				map(queryParamMap =>
					this.queryParameterService.updateQueryParams(queryParamMap, params))
			);

		update$
			.subscribe(newQueryParams => {
				this.router.navigate(["management", "orders"], {queryParams: newQueryParams, replaceUrl: true});
			}, null, () => this.loading = false);

		return update$;
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

}
