import {Injectable} from "@angular/core";
import {ModifyType} from "./modify-type";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ShopItem} from "../../../shared/model/shop-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EventService} from "../../../shared/services/api/event.service";
import {UserService} from "../../../shared/services/api/user.service";
import {EntryService} from "../../../shared/services/api/entry.service";
import {Tour} from "../../shared/model/tour";
import {AddressService} from "../../../shared/services/api/address.service";
import {Merchandise} from "../../shared/model/merchandise";
import {StockService} from "../../../shared/services/api/stock.service";
import {ServletServiceInterface} from "../../../shared/model/servlet-service";
import {Location} from "@angular/common";
import {NavigationService} from "../../../shared/services/navigation.service";
import {ParamMap, Params, Router} from "@angular/router";
import {Address} from "../../../shared/model/address";
import {ImageUploadService} from "../../../shared/services/api/image-upload.service";
import {ModifyItemEvent} from "./modify-item-event";
import {MerchStockList} from "../../shared/model/merch-stock";
import {combineLatest} from "rxjs/observable/combineLatest";
import {first, map, mergeMap, take, tap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {Event} from "../../shared/model/event";
import {of} from "rxjs/observable/of";
import {timer} from "rxjs/observable/timer";
import {ModifiedImages} from "./modified-images";

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
	 * @param {ShopItem} objectToModify
	 */
	extractStock(objectToModify: ShopItem) {
		let merch: Merchandise = (<Merchandise>objectToModify);
		this.stockService.getByEventId(merch.id)
			.pipe(take(1))
			.subscribe(stockList => {
				this.previousStock = [...stockList];
			});
	}


	/**
	 *
	 * @param {ParamMap} queryParamMap
	 */
	readQueryParams(queryParamMap: ParamMap) {
		if (queryParamMap.has("eventId")) {
			this.eventId = +queryParamMap.get("eventId");
		}
	}

	/**
	 *
	 */
	init() {
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
				if (this.itemType === ShopItemType.merch) {
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
	 * @param {Address[]} addresses
	 * @returns {Observable<any>}
	 */
	removeOldAddresses(addresses: Address[]): Observable<any> {
		if (this.previousValue) {
			let previousAddresses: number[] = [];
			if (EventUtilityService.isTour(this.previousValue) || EventUtilityService.isParty(this.previousValue)) {
				previousAddresses = this.previousValue.route;
			}
			if (EventUtilityService.isUser(this.previousValue)) {
				previousAddresses = this.previousValue.addresses;
			}
			const addressesToDelete = previousAddresses
				.filter(id => addresses.findIndex(address => address.id === id) === -1);

			if (addressesToDelete.length === 0 || (previousAddresses.length === 0 && addresses.length === 0)) {
				return of([]);
			}


			return combineLatest(
				...addressesToDelete
					.map(id => this.addressService.remove(id))
			)
		}
		return of([]);
	}

	/**
	 *
	 * @param {Address[]} addresses
	 * @returns {Observable<Address[]>}
	 */
	updateAddresses(addresses: Address[]): Observable<Address[]> {
		if (addresses.length === 0) {
			return of([]);
		}

		return combineLatest(
			...addresses.map((route: Address) => {
				//only add routes that aren't already part of the system
				if (route.id >= 0) {
					//but modify them in case they're different
					return this.addressService.modify(route);
				}
				else {
					return this.addressService.add(route)
				}
			})
		);
	}

	/**
	 *
	 * @param {ShopItem} newObject
	 * @returns {Promise<ShopItem>}
	 */
	handleAddresses(newObject: ShopItem): Observable<ShopItem> {
		let addresses: any[] = [];
		let key = "addresses";
		if (EventUtilityService.isTour(newObject) || EventUtilityService.isParty(newObject)) {
			addresses = newObject.route;
			key = "route";
		}
		if (newObject["addresses"]) {
			addresses = newObject["addresses"];
		}

		//delete old addresses if length < previousLength
		return this.removeOldAddresses(addresses)
			.pipe(
				mergeMap(() => {
					//no need to modify/add the addresses if there are none
					if (!addresses || addresses.length === 0) {
						return of([]);
					}

					//todo instead of combineLatest: add routes one after another (to avoid transaction errors)
					return this.updateAddresses(addresses);
				}),
				map(addresses => {
					(<any>newObject)[key] = [...addresses.map(it => it.id)];
					return newObject;
				})
			);

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
	 * @param {string[]} imagePaths
	 * @returns {Observable<any[]>}
	 */
	deleteOldImages(imagePaths: string[]) {
		if (this.previousValue) {
			const previousImagePaths = this.previousValue.images;
			const imagesToDelete = previousImagePaths
				.filter(path => imagePaths.indexOf(path) === -1);

			if (imagesToDelete.length === 0) {
				return of([]);
			}

			return combineLatest(
				...imagesToDelete
					.map(path => this.imageUploadService.deleteImage(path))
			);
		}
		return of([]);
	}

	/**
	 *
	 * @param newObject
	 * @param images
	 */
	uploadImage(newObject: ShopItem, images: ModifiedImages): Observable<ShopItem> {
		const {imagePaths, imagesToUpload} = images;

		if (EventUtilityService.isMerchandise(newObject) || EventUtilityService.isTour(newObject) ||
			EventUtilityService.isUser(newObject) || EventUtilityService.isParty(newObject)) {

			if (imagesToUpload) {
				//todo: error handling, progress report
				let formData = new FormData();
				imagesToUpload.forEach(image => {
					const blob = this.imageUploadService.dataURItoBlob(image.data);
					formData.append("file[]", blob, image.name);
				});

				return this.imageUploadService.uploadImages(formData)
					.pipe(
						map(response => response.images),
						map(images => (<any>newObject).setProperties({images: [...imagePaths, ...images]}))
					)

			}
		}

		return of((<any>newObject).setProperties({images: [...imagePaths]}));
	}

	/**
	 *
	 * @param modifyItemEvent
	 */
	submitModifiedEvent(modifyItemEvent: ModifyItemEvent) {
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

		let newObject: ShopItem = modifyItemEvent.item;
		if (this.idOfObjectToModify && this.idOfObjectToModify >= 0) {
			(<any>newObject).setProperties({id: this.idOfObjectToModify});
		}

		//handle addresses correctly
		const request = this.handleAddresses(newObject)
			.pipe(
				map(newObject => this.setDefaultValues(newObject)),
				tap(() => this.deleteOldImages(modifyItemEvent.images.imagePaths)),
				//todo display progress-bar while uploading
				mergeMap(newObject => this.uploadImage(newObject, modifyItemEvent.images)),
				mergeMap(newObject => this.mode === ModifyType.EDIT
					? service.modify.bind(service)(newObject)
					: service.add.bind(service)(newObject)
				),
				mergeMap((result: ShopItem) => EventUtilityService.isMerchandise(result) && modifyItemEvent.stock
					? this.stockService.pushChanges(result, [...this.previousStock], [...modifyItemEvent.stock])
						.pipe(map(() => result))
					: of(result)
				),
				first()
			);

		//perform request
		request
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
					//todo global error handler that shows toast or some kind of notification
					console.log("adding or editing object went wrong");
					console.error(error);
					console.log(newObject);
				},
				() => {
					this.reset();
				}
			);

		//return request for additional error handling / whatever
		return request;
	}
}
