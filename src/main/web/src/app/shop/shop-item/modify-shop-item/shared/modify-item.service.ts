import {Injectable} from '@angular/core';
import {ModifyType} from "../modify-type";
import {ShopItemType} from "../../../shared/model/shop-item-type";
import {ShopItem} from "../../../../shared/model/shop-item";
import {Observable} from "rxjs/Observable";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventService} from "../../../../shared/services/event.service";
import {UserService} from "../../../../shared/services/user.service";
import {EntryService} from "../../../../shared/services/entry.service";
import {Party} from "../../../shared/model/party";
import {Tour} from "../../../shared/model/tour";
import {AddressService} from "../../../../shared/services/address.service";
import {Merchandise} from "../../../shared/model/merchandise";
import {StockService} from "../../../../shared/services/stock.service";
import {User} from "app/shared/model/user";
import {ServletServiceInterface} from "../../../../shared/model/servlet-service";
import {Entry} from "../../../../shared/model/entry";
import {Event} from "../../../shared/model/event";
import {Location} from "@angular/common";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {ParamMap, Params} from "@angular/router";
import * as moment from "moment";
import {Address} from "../../../../shared/model/address";

@Injectable()
export class ModifyItemService {
	//either add or edit
	mode: ModifyType;

	//either merch, tour, party, user or entry
	itemType: ShopItemType;
	eventType: (ShopItemType);

	//wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	//ansonsten wird das übergebene Objekt editiert
	idOfObjectToModify: number;
	eventId: number = -1;

	previousValue: ShopItem;
	model: any = {};


	constructor(public eventService: EventService,
				public userService: UserService,
				public location: Location,
				public navigationService: NavigationService,
				public entryService: EntryService,
				public addressService: AddressService,
				public stockService: StockService) {
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
			this.model["date"] = moment(queryParamMap.get("date")).toDate();
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
		Observable.combineLatest(...objectToModify[addressKey].map(addressId => this.addressService.getById(addressId)))
			.first()
			.subscribe(addresses => {
				this.model[addressKey] = [...addresses];
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
			.first()
			.subscribe(stockList => {
				this.model["stock"] = stockList;
				if (objectToModify && objectToModify.id !== -1) {
					this.previousValue = objectToModify;
				}
			});
	}

	/**
	 *
	 */
	init() {
		//service was already initialized. reset() needs to be called before the user can use it any further
		if (Object.keys(this.model).length > 0) {
			return;
		}
		if (this.idOfObjectToModify !== -1) {
			let objectToModifyObservable: Observable<ShopItem> = EventUtilityService.handleOptionalShopType<any>(
				this.itemType,
				{
					merch: () => this.eventService.getById(this.idOfObjectToModify),
					tours: () => this.eventService.getById(this.idOfObjectToModify),
					partys: () => this.eventService.getById(this.idOfObjectToModify),
					members: () => this.userService.getById(this.idOfObjectToModify),
					entries: () => this.entryService.getById(this.idOfObjectToModify),
				});

			//initialize model with object
			objectToModifyObservable.first().subscribe(objectToModify => {
				Object.keys(objectToModify).forEach(key => {
					this.model[key] = objectToModify[key];
				});

				//extract addresses if we're editing a tour or a party
				if (this.itemType === ShopItemType.tour || this.itemType === ShopItemType.party) {
					this.extractAddresses(objectToModify, "route");
				}
				else if (this.itemType === ShopItemType.user) {
					if ((<User>objectToModify).addresses.length > 0) {
						Observable.combineLatest(...(<User>objectToModify).addresses
							.map(addressId => this.addressService.getById(addressId))
						)
							.first()
							.subscribe(addresses => {
								this.model["addresses"] = [...addresses];
								if (objectToModify && objectToModify.id !== -1) {
									this.previousValue = objectToModify;
								}
							});
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
	}

	/**
	 *
	 * @param model
	 */
	watchForAddressModification(model: any) {
		if (model.action && model.action === "delete") {
			const addressToDelete: Address = model.address;
			const currentAddresses: number[] = this.model["addresses"];
			const deletedAddressId: number = currentAddresses
				.findIndex(currentAddress => currentAddress === addressToDelete.id);

			if (deletedAddressId >= 0) {
				currentAddresses.splice(deletedAddressId, 1);
			}

			this.model["addresses"] = [...currentAddresses];
		}
		this.addressService.addressModificationDone
			.first()
			.subscribe(address => {
				if (address) {
					const currentAddresses: number[] = this.model["addresses"];
					const modifiedAddressIndex = currentAddresses
						.findIndex(currentAddress => currentAddress === address.id);
					//address was added
					if (modifiedAddressIndex === -1) {
						currentAddresses.push(address.id);
					}
					//address was modified => dont do anything

					this.model["addresses"] = [...currentAddresses];
				}
			})
	}

	/**
	 *
	 * @param model
	 */
	submitModifiedEvent(model: any) {
		let service: ServletServiceInterface<ShopItem> = EventUtilityService.handleOptionalShopType<ServletServiceInterface<User | Entry | Event>>(
			this.itemType,
			{
				merch: () => this.eventService,
				tours: () => this.eventService,
				partys: () => this.eventService,
				members: () => this.userService,
				entries: () => this.entryService
			}
		);

		let newObject: ShopItem = EventUtilityService.handleOptionalShopType<ShopItem>(
			this.itemType,
			{
				merch: () => Merchandise.create().setProperties(this.model),
				tours: () => Tour.create().setProperties(this.model),
				partys: () => Party.create().setProperties(this.model),
				members: () => User.create().setProperties(this.model),
				entries: () => Entry.create().setProperties(this.model)
			}
		);

		let options: any = EventUtilityService.handleOptionalShopType<any>(this.itemType,
			{
				entries: () => ({eventId: model["eventId"]})
			});

		//todo upload image seperately


		//todo display "submitting..." while waiting for response from server
		let requestMethod = service.add.bind(service);
		if (this.mode === ModifyType.EDIT) {
			requestMethod = service.modify.bind(service);
		}
		requestMethod(newObject, options)
			.subscribe(
				(result: ShopItem) => {
					if (this.itemType === ShopItemType.entry) {
						this.location.back();
					}
					if (!this.eventType && !this.eventId) {
						//navigiere zum neu erstellten item
						this.navigationService.navigateToItem(result);
					}
					else {
						console.log(result);
						//todo
						this.navigationService.navigateToItemWithId(this.eventType, this.eventId);
					}
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
