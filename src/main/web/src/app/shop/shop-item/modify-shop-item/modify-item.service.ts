import {Injectable} from "@angular/core";
import {ModifyType} from "./modify-type";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ShopItem} from "../../../shared/model/shop-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EventService} from "../../../shared/services/api/event.service";
import {UserService} from "../../../shared/services/api/user.service";
import {EntryService} from "../../../shared/services/api/entry.service";
import {Party} from "../../shared/model/party";
import {Tour} from "../../shared/model/tour";
import {AddressService} from "../../../shared/services/api/address.service";
import {Merchandise} from "../../shared/model/merchandise";
import {StockService} from "../../../shared/services/api/stock.service";
import {User} from "app/shared/model/user";
import {ServletServiceInterface} from "../../../shared/model/servlet-service";
import {Entry} from "../../../shared/model/entry";
import {Location} from "@angular/common";
import {NavigationService} from "../../../shared/services/navigation.service";
import {NavigationEnd, ParamMap, Params, Router} from "@angular/router";
import * as moment from "moment";
import {isMoment, Moment} from "moment";
import {Address} from "../../../shared/model/address";
import {ImageUploadService} from "../../../shared/services/api/image-upload.service";
import {ModifyItemEvent} from "./modify-item-event";
import {MerchStockList} from "../../shared/model/merch-stock";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {combineLatest} from "rxjs/observable/combineLatest";
import {defaultIfEmpty, filter, first, map, mergeMap, scan, take} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {Event} from "../../shared/model/event";
import {of} from "rxjs/observable/of";

@Injectable()
export class ModifyItemService {
	//either add or edit
	mode: ModifyType;

	//either merch, tour, party, user or entry
	itemType: ShopItemType;
	eventType: (ShopItemType);

	//wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	//ansonsten wird das übergebene Objekt editiert
	idOfObjectToModify: number = -1;
	eventId: number = -1;

	previousValue: ShopItem;

	//only used if itemType === merch
	previousStock: MerchStockList = [];

	private _model$ = new BehaviorSubject<any>({});
	public model$ = this._model$.asObservable();

	constructor(public eventService: EventService,
				public imageUploadService: ImageUploadService,
				public userService: UserService,
				public location: Location,
				public router: Router,
				public navigationService: NavigationService,
				public entryService: EntryService,
				public addressService: AddressService,
				public stockService: StockService) {
	}

	get model() {
		return this._model$.getValue();
	}

	set model(model: any) {
		this._model$.next(model);
	}

	/**
	 *
	 */
	reset() {
		this.mode = undefined;

		//either merch, tour, party, user or entry
		this.itemType = undefined;
		this.eventType = undefined;

		//wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
		//ansonsten wird das übergebene Objekt editiert
		this.idOfObjectToModify = -1;
		this.eventId = -1;

		this.previousValue = undefined;
		this.previousStock = [];
		this.model = {};
	}

	/**
	 *
	 * @param {Params} params
	 */
	readParams(params: Params) {
		this.itemType = ShopItemType[ShopItemType[params["itemType"]]];
		this.eventId = +params["eventId"];
		if (this.eventId >= 0) {
			this.eventType = this.itemType;
			this.itemType = ShopItemType.entry;
		}

		this.idOfObjectToModify = params["id"] ? +(params["id"]) : -1;
	}

	/**
	 *
	 * @param {ParamMap} queryParamMap
	 */
	readQueryParams(queryParamMap: ParamMap) {
		if (queryParamMap.has("date")) {
			this.model["date"] = moment(queryParamMap.get("date"));
		}
		if (queryParamMap.has("eventId")) {
			this.eventId = +queryParamMap.get("eventId");
		}
	}

	/**
	 *
	 * @param {ShopItem} objectToModify
	 * @param {keyof Party | keyof Tour | keyof User} addressKey
	 */
	extractAddresses(objectToModify: ShopItem, addressKey: (keyof Party | keyof Tour | keyof User)) {
		this.model[addressKey] = undefined;
		combineLatest(...objectToModify[addressKey].map(addressId => this.addressService.getById(addressId)))
			.pipe(take(1))
			.subscribe(addresses => {
				this.model[addressKey] = [...addresses];
				this.model = {...this.model};
				if (objectToModify && objectToModify.id !== -1) {
					this.previousValue = objectToModify;
				}
			});
	}

	/**
	 *
	 * @param {ShopItem} objectToModify
	 */
	extractStock(objectToModify: ShopItem) {
		let merch: Merchandise = (<Merchandise>objectToModify);
		this.stockService.getByEventId(merch.id)
			.pipe(first())
			.subscribe(stockList => {
				this.model["stock"] = stockList;
				this.model = {...this.model};
				this.previousStock = [...stockList];
				if (objectToModify && objectToModify.id !== -1) {
					this.previousValue = objectToModify;
				}
			});
	}

	/**
	 *
	 */
	init() {
		const setDateAndTime = (value: Moment) => {
			this.model["date"] = value;
			this.model["time"] = value.format("HH:mm");
		};

		//service was already initialized. reset() needs to be called before the user can use it any further
		if (this.mode !== undefined) {
			return;
		}
		if (this.idOfObjectToModify >= 0) {
			let objectToModifyObservable: Observable<ShopItem> = EventUtilityService.shopItemSwitch<any>(
				this.itemType,
				{
					merch: () => this.eventService.getById(this.idOfObjectToModify),
					tours: () => this.eventService.getById(this.idOfObjectToModify),
					partys: () => this.eventService.getById(this.idOfObjectToModify),
					members: () => this.userService.getById(this.idOfObjectToModify),
					entries: () => this.entryService.getById(this.idOfObjectToModify),
				});

			//initialize model with object
			objectToModifyObservable.pipe(first()).subscribe(objectToModify => {
				Object.keys(objectToModify).forEach(key => {
					this.model[key] = objectToModify[key];
				});


				//extract addresses if we're editing a tour or a party
				if (this.itemType === ShopItemType.tour || this.itemType === ShopItemType.party) {
					this.extractAddresses(objectToModify, "route");

					//initialize time as well, if a date is specified
					const date = this.model["date"];
					if (isMoment(date)) {
						this.model["time"] = date.format("HH:mm");
					}
				}
				else if (this.itemType === ShopItemType.user) {
					if ((<User>objectToModify).addresses.length > 0) {
						this.extractAddresses(objectToModify, "addresses");
					}
				}
				//extract the stock if we're editing a merchandise object
				else if (this.itemType === ShopItemType.merch) {
					this.extractStock(objectToModify);
				}

				//modus === EDIT
				if (objectToModify && objectToModify.id !== -1) {
					this.previousValue = objectToModify;
				}
			});
			this.mode = ModifyType.EDIT;
		}
		else {
			this.mode = ModifyType.ADD;
		}

		if (!this.model["date"]) {
			EventUtilityService.shopItemSwitch<any>(
				this.itemType,
				{
					tours: () => setDateAndTime(moment()),
					partys: () => setDateAndTime(moment()),
				});
		}
		else if (!this.model["time"]) {
			EventUtilityService.shopItemSwitch(
				this.itemType,
				{
					tours: () => setDateAndTime(this.model["date"]),
					partys: () => setDateAndTime(this.model["date"]),
				}
			)
		}
		if (!this.model["addresses"]) {
			this.model["addresses"] = [];
		}

		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd),
				map(event => (<NavigationEnd>event)),
				scan((acc: NavigationEnd[], value: NavigationEnd) => {
					return [...acc, value];
				}, []),
				//check that the url currently routed to isn't the one we started at AND not the address-modification route
				filter(events => events.length > 1 && !events[events.length - 1].urlAfterRedirects.includes("address") &&
					events[events.length - 1].urlAfterRedirects !== events[0].urlAfterRedirects),
				first()
			)
			.subscribe(() => this.reset());
	}

	/**
	 *
	 * @param model
	 */
	watchForAddressModification(model: any) {
		const currentAddresses: Address[] = [...this.model["addresses"]];
		if (model.action && model.action === "delete") {
			const addressToDelete: Address = model.address;
			const deletedAddressId: number = currentAddresses
				.findIndex(currentAddress => currentAddress.id === addressToDelete.id);

			if (deletedAddressId >= 0) {
				currentAddresses.splice(deletedAddressId, 1);
			}

			this.model["addresses"] = [...currentAddresses];
			this.model = {...this.model};
		}
		this.addressService.addressModificationDone
			.pipe(first())
			.subscribe(address => {
				if (address) {
					const modifiedAddressIndex = currentAddresses
						.findIndex(currentAddress => currentAddress.id === address.id);
					//address was added
					if (modifiedAddressIndex === -1) {
						currentAddresses.push(address);
					}
					//address was modified => push back into array
					else {
						this.model["addresses"] = currentAddresses.splice(modifiedAddressIndex, 1, address);
					}

					this.model["addresses"] = [...currentAddresses];
					this.model = {...this.model};
				}
			})
	}

	isAddressArray(value: any[]): value is Address[] {
		return value[0].latitude !== undefined;
	}

	/**
	 *
	 * @param {ShopItem} newObject
	 * @returns {Promise<ShopItem>}
	 */
	async addAddresses(newObject: ShopItem): Promise<ShopItem> {
		if (EventUtilityService.isTour(newObject) || EventUtilityService.isParty(newObject)) {
			//todo instead of combineLatest: add routes one after another (to avoid transaction errors)
			if (this.isAddressArray(newObject.route)) {
				let addresses = await combineLatest(
					...newObject.route.map((route: Address) => this.addressService.add(route))
				)
					.toPromise();

				newObject.setProperties({route: [...addresses]});
			}
		}
		return newObject
	}

	/**
	 *
	 * @param {ShopItem} newObject
	 * @returns {ShopItem}
	 */
	setDefaultValues(newObject: ShopItem) {
		if (EventUtilityService.isTour(newObject)) {
			newObject.setProperties((<Partial<Tour>>{emptySeats: newObject.capacity}));
		}
		return newObject;
	}

	/**
	 *
	 * @param newObject
	 * @param {FormData} uploadedImage
	 */
	async uploadImage(newObject: ShopItem, uploadedImage: FormData): Promise<ShopItem> {
		if (EventUtilityService.isMerchandise(newObject) || EventUtilityService.isTour(newObject) ||
			EventUtilityService.isUser(newObject) || EventUtilityService.isParty(newObject)) {

			if (uploadedImage) {
				//todo: error handling, progress report
				let images = await this.imageUploadService.uploadImages(uploadedImage)
					.pipe(
						map(response => response.images)
					)
					.toPromise();

				//thanks typescript..
				if (EventUtilityService.isUser(newObject)) {
					return newObject.setProperties({images});
				}
				return newObject.setProperties({images});
			}
		}

		return newObject;
	}

	/**
	 *
	 * @param modifyItemEvent
	 */
	async submitModifiedEvent(modifyItemEvent: ModifyItemEvent) {
		const service: ServletServiceInterface<ShopItem | Event> = EventUtilityService.shopItemSwitch<ServletServiceInterface<ShopItem | Event>>(
			this.itemType,
			{
				merch: () => this.eventService,
				tours: () => this.eventService,
				partys: () => this.eventService,
				members: () => this.userService,
				entries: () => this.entryService
			}
		);

		let newObject: ShopItem = EventUtilityService.shopItemSwitch<ShopItem>(
			this.itemType,
			{
				merch: () => Merchandise.create().setProperties(this.model),
				tours: () => Tour.create().setProperties(this.model),
				partys: () => Party.create().setProperties(this.model),
				members: () => User.create().setProperties(this.model),
				entries: () => Entry.create().setProperties(this.model)
			}
		);

		const options: any = EventUtilityService.shopItemSwitch<any>(this.itemType,
			{
				entries: () => ({eventId: modifyItemEvent.eventId})
			});

		//handle addresses correctly
		if (EventUtilityService.isUser(newObject)) {
			newObject.setProperties({addresses: newObject.addresses.map((it: any) => it.id)});
		}
		newObject = await this.addAddresses(newObject);
		newObject = this.setDefaultValues(newObject);

		//todo display progress-bar while uploading
		newObject = await this.uploadImage(newObject, modifyItemEvent.uploadedImage);


		//todo display "submitting..." while waiting for response from server
		let requestMethod = service.add.bind(service);
		if (this.mode === ModifyType.EDIT) {
			requestMethod = service.modify.bind(service);
		}

		requestMethod(newObject, options)
			.pipe(
				mergeMap((result: ShopItem) => {
					if (EventUtilityService.isMerchandise(result)) {
						// this.stockService.add(model["stock"], newObject.id)
						console.log(modifyItemEvent.model["stock"]);

						return this.stockService.pushChanges(
							result,
							[...this.previousStock],
							[...modifyItemEvent.model["stock"]]
						)
							.pipe(
								map(() => (<any>result))
							)
					}
					return of(result);
				}),
				first()
			)
			.subscribe(
				(result: ShopItem) => {
					if (this.itemType === ShopItemType.entry) {
						this.navigationService.navigateByUrl("/management/costs");
					}
					else if (!this.eventType && !this.eventId) {
						//navigiere zum neu erstellten item
						this.navigationService.navigateToItem(result);
					}
					else {
						this.navigationService.navigateToItemWithId(this.eventType, this.eventId);
					}
					this.reset();
				},
				error => {
					console.log("adding or editing object went wrong");
					console.error(error);
					console.log(newObject);
				},
				() => {
					this.reset();
				}
			);
	}
}
