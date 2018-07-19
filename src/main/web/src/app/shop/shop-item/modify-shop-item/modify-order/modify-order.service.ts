import {Injectable} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderedItem} from "../../../../shared/model/ordered-item";
import {createOrder, Order} from "../../../../shared/model/order";
import {UserService} from "../../../../shared/services/api/user.service";
import {combineLatest, Observable, of} from "rxjs";
import {format, setHours, setMinutes} from "date-fns";
import {OrderService} from "../../../../shared/services/api/order.service";
import {Params, Router} from "@angular/router";
import {User} from "../../../../shared/model/user";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {processSequentially} from "../../../../util/observable-util";
import {map, mergeMap} from "rxjs/operators";
import {isEdited} from "../../../../util/util";
import {PaymentMethod} from "../../../checkout/payment/payment-method";
import {BankAccount} from "../../../../shared/model/bank-account";
import {setProperties} from "../../../../shared/model/util/base-object";

@Injectable()
export class ModifyOrderService {


	public formGroup: FormGroup = this.formBuilder.group({
		"user": [undefined, {
			validators: [Validators.required]
		}],
		"date": [undefined, {
			validators: [Validators.required]
		}],
		"time": [undefined, {
			validators: [Validators.required, Validators.pattern(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/i)]
		}],
		"method": [undefined, {
			validators: [Validators.required]
		}],
		"items": [[], {
			validators: [Validators.required]
		}],
		"bankAccount": [undefined, {
			validators: []
		}]
	});

	_previousValue: Order = null;

	constructor(private formBuilder: FormBuilder,
				private orderService: OrderService,
				private orderedItemService: OrderedItemService,
				private router: Router,
				private userService: UserService) {
	}

	initFromParams(params: Params) {
		if (params["id"]) {
			this.orderService.getById(+params["id"])
				.subscribe(order => this.setOrder(order));
		}
	}

	/**
	 *
	 * @param {Order} order
	 */
	setOrder(order: Order) {
		combineLatest(
			this.userService.getById(order.user)
		)
			.subscribe(([user]) => {
				this.formGroup.patchValue({
					"user": user,
					"date": order.timeStamp,
					"time": format(order.timeStamp, "HH:mm"),
					"method": order.method,
					"items": [...order.items],
					"bankAccount": order.bankAccount
				} as any)
			});
		this._previousValue = setProperties(createOrder(), (
			{...order}
		));
	}

	/**
	 *
	 * @param {OrderedItem} item
	 * @param {number} index
	 */
	updateItem(index: number, item?: OrderedItem) {
		const currentValue = this.formGroup.get("items").value;
		currentValue.splice(index, 1, item);
		this.formGroup.get("items").setValue([...currentValue]);
	}

	/**
	 *
	 * @param {User} user
	 */
	updateUser(user: User) {
		this.formGroup.get("user").patchValue(user);
	}

	getDate(date: Date, time: string): Date {
		const [hours, minutes] = time.split(":");
		console.log(date);
		return setMinutes(setHours(date, +hours), +minutes);
	}

	/**
	 *
	 * @param {OrderedItem[]} orderedItems
	 * @returns {Observable<any>}
	 */
	removeOldOrderedItems(orderedItems: OrderedItem[]): Observable<any> {
		if (this._previousValue) {
			let previousItems: number[] = this._previousValue.items
				.map(it => it.id);
			const itemsToDelete = previousItems
				.filter(id => orderedItems.findIndex(item => item.id === id) === -1);

			if (itemsToDelete.length === 0 || (previousItems.length === 0 && orderedItems.length === 0)) {
				return of([]);
			}

			return processSequentially(
				itemsToDelete
					.map(id => this.orderedItemService.remove(id))
			)
		}
		return of([]);
	}

	updateOrderedItems(orderedItems: OrderedItem[]) {
		if (orderedItems.length === 0) {
			return of([]);
		}

		return processSequentially(
			orderedItems.map(item => {
				//only add routes that aren't already part of the system
				if (item.id >= 0) {
					return this.orderedItemService.getById(item.id)
						.pipe(
							//but modify them in case they're different
							mergeMap(prevAddress => isEdited(prevAddress, item, ["id"])
								? this.orderedItemService.modify(item)
								//otherwise don't do anything
								: of(prevAddress)
							)
						);
				}

				return this.orderedItemService.add(item);
			})
		);
	}

	/**
	 *
	 * @param {OrderedItem[]} orderedItems
	 */
	handleOrderedItems(orderedItems: OrderedItem[]): Observable<number[]> {
		return this.removeOldOrderedItems(orderedItems)
			.pipe(
				mergeMap(() => {
					//no need to modify/add the items if there are none
					if (!orderedItems || orderedItems.length === 0) {
						return of([]);
					}

					return this.updateOrderedItems(orderedItems);
				}),
				map(orderedItems => [...orderedItems].map(it => it.id))
			);
	}

	/**
	 *
	 * @returns {Observable<Order>}
	 */
	getRequest(): Observable<Order> {
		/*

		"user": [undefined, {
			validators: [Validators.required]
		}],
		"date": [undefined, {
			validators: [Validators.required]
		}],
		"time": [undefined, {
			validators: [Validators.required, Validators.pattern(/([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/i)]
		}],
		"method": [undefined, {
			validators: [Validators.required]
		}],
		"items": [[], {
			validators: [Validators.required]
		}],
		"bankAccount": [undefined, {
			validators: []
		}]
		 */
		const value = {...this.formGroup.value} as { user: User, date: Date, time: string, method: PaymentMethod, items: OrderedItem[], bankAccount: BankAccount }
		let order: Order = setProperties(createOrder(), {
			timeStamp: this.getDate(value.date, value.time),
			method: value.method,
			user: value.user.id,
		});

		if (value.method === PaymentMethod.DEBIT && value.bankAccount) {
			order = setProperties(order, {
				bankAccount: value.bankAccount.id
			})
		}

		return this.handleOrderedItems(
			[...value.items].map(it => {
				return {
					...it,
					item: it.item.id
				}
			}) as any[]
		)
			.pipe(
				mergeMap(newIds => {
					order = setProperties(order, {
						items: newIds
					});

					if (this._previousValue !== null) {
						return this.orderService.modify(setProperties(this._previousValue, {
							...order,
							bankAccount: order.method === PaymentMethod.DEBIT ? order.bankAccount : null,
							id: this._previousValue.id
						}));
					}
					return this.orderService.add(setProperties(createOrder(), {
						...order
					}));
				})
			)

	}

	submit() {
		this.getRequest()
			.subscribe(order => {
					//todo?
					this.router.navigateByUrl("/management/orders")
				},
				error => {
					console.error(error);
					//todo?
				})
	}


	cancel() {
		this.router.navigateByUrl("/management/orders");
	}
}
