import {Injectable, OnDestroy} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {OrderStatusList} from "../../shared/model/order-status";
import {paymentMethodList} from "../../shop/checkout/payment/payment-method";
import {first, map, mergeMap} from "rxjs/operators";
import {ParamMap, Params, Router} from "@angular/router";
import {isValid, parse} from "date-fns";
import {NavigationService} from "../../shared/services/navigation.service";
import {QueryParameterService} from "../../shared/services/query-parameter.service";
import {combineLatest, Observable, of} from "rxjs";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {OrderOverviewService} from "./order-overview.service";
import {EventService} from "../../shared/services/api/event.service";

interface OrderOptionsFormValue {
	from: Date;
	to: Date;
	eventId: number[];
	userIds: number[];
	status: { [status: string]: boolean };
	method: { [method: string]: boolean };
}

@Injectable()
export class OrderOptionsService implements OnDestroy {

	public formGroup: FormGroup;

	loading = false;

	subscriptions = [];

	public eventAutocompleteFormControl = new FormControl();
	public events = [];

	constructor(private formBuilder: FormBuilder,
				private queryParameterService: QueryParameterService,
				private orderOverviewService: OrderOverviewService,
				private router: Router,
				private eventService: EventService,
				private navigationService: NavigationService) {
		this.formGroup = this.formBuilder.group({
			"from": [undefined],
			"to": [undefined],
			"eventId": [[]],
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

	onRemoveEvent(i: number) {
		this.events.splice(i, 1);
		this.formGroup.get("eventId").setValue(this.events.map(it => it.id));
	}

	onAddEvent(event) {
		this.events.push(event);
		const value = [...this.events.map(it => it.id)];
		this.formGroup.get("eventId").setValue(value);
	}

	/**
	 *
	 * @param object
	 * @param keys
	 */
	readBinaryValuesFromQueryParams(object: {
		[key: string]: boolean
	}, keys: string[]) {
		if (keys.length === 0) {
			return;
		}

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
		if (queryParamMap.has("eventId")) {
			value.eventId = getAllQueryValues(queryParamMap, "eventId").map(it => +it);
			combineLatest(
				...value.eventId.map(id => this.eventService.getById(id))
			).subscribe(it => {
				this.events = [...it];
			});
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

		params["eventId"] = formValue.eventId.join(",");
		params["userIds"] = formValue.userIds;

		params["minTimeStamp"] = (!formValue.from || !isValid(formValue.from)) ? "" : formValue.from.toISOString();
		params["maxTimeStamp"] = (!formValue.to || !isValid(formValue.to)) ? "" : formValue.to.toISOString();

		params["page"] = 1;

		const update$ = this.navigationService.queryParamMap$
			.pipe(
				first(),
				map(queryParamMap =>
					this.queryParameterService.updateQueryParams(queryParamMap, params))
			);

		update$
			.subscribe(newQueryParams => {
				this.router.navigate(["management", "orders"], {queryParams: newQueryParams, replaceUrl: true});
				this.orderOverviewService.dataSource.update();
			}, null, () => this.loading = false);

		return update$;
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

}
