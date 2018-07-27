import {Injectable} from "@angular/core";
import {ModifyType} from "./modify-type";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ShopItem} from "../../../shared/model/shop-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EventService} from "../../../shared/services/api/event.service";
import {UserService} from "../../../shared/services/api/user.service";
import {EntryService} from "../../../shared/services/api/entry.service";
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
import {first, map, mergeMap, share, take, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {Event} from "../../shared/model/event";
import {ModifiedImages} from "./modified-images";
import {processSequentially} from "../../../util/observable-util";
import {isEdited} from "../../../util/util";
import {TransactionBuilder} from "../../../util/transaction-builder";
import {MatSnackBar} from "@angular/material";
import {setProperties} from "../../../shared/model/util/base-object";

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

	loading = false;

	constructor(public eventService: EventService,
				public imageUploadService: ImageUploadService,
				public userService: UserService,
				public location: Location,
				public router: Router,
				public matSnackBar: MatSnackBar,
				public navigationService: NavigationService,
				public entryService: EntryService,
				public addressService: AddressService,
				public stockService: StockService) {
	}

	/**
	 *
	 */
	reset() {
		this.loading = false;
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
					merch: () => <Observable<ShopItem>>this.eventService.getById(this.idOfObjectToModify),
					tours: () => <Observable<ShopItem>>this.eventService.getById(this.idOfObjectToModify),
					partys: () => <Observable<ShopItem>>this.eventService.getById(this.idOfObjectToModify),
					members: () => <Observable<ShopItem>>this.userService.getById(this.idOfObjectToModify),
					entries: () => <Observable<ShopItem>>this.entryService.getById(this.idOfObjectToModify),
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


			return processSequentially(
				addressesToDelete
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

		return processSequentially(
			addresses.map(address => {
				//only add routes that aren't already part of the system
				if (address.id >= 0) {
					return this.addressService.getById(address.id)
						.pipe(
							//but modify them in case they're different
							mergeMap(prevAddress => isEdited(prevAddress, address, ["id", "user"])
								? this.addressService.modify(address)
								//otherwise don't do anything
								: of(prevAddress)
							)
						);
				}

				return this.addressService.add(address);
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

		const id = newObject.id === -1 ? null : newObject.id;
		if (EventUtilityService.isUser(newObject)) {
			addresses = addresses.map(it => setProperties(it, {user: id}));
		}
		else {
			addresses = addresses.map(it => setProperties(it, {item: id}));
		}

		//delete old addresses if length < previousLength
		return this.removeOldAddresses(addresses)
			.pipe(
				mergeMap(() => {
					//no need to modify/add the addresses if there are none
					if (!addresses || addresses.length === 0) {
						return of([]);
					}

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
			newObject = setProperties(newObject, {emptySeats: newObject.capacity});
		}
		return newObject;
	}

	/**
	 *
	 * @param {string[]} imagePaths
	 * @param previousValue
	 * @returns {Observable<any[]>}
	 */
	deleteOldImages(imagePaths: string[], previousValue: ShopItem = this.previousValue): Observable<any[]> {
		if (previousValue) {
			const previousImagePaths = previousValue.images;
			const imagesToDelete = previousImagePaths
				.filter(path => imagePaths.indexOf(path) === -1);

			if (imagesToDelete.length === 0) {
				return of([]);
			}

			return processSequentially(
				imagesToDelete
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

		if (imagesToUpload && imagesToUpload.length > 0) {
			//todo: error handling, progress report
			let formData = new FormData();
			imagesToUpload.forEach(image => {
				const blob = this.imageUploadService.dataURItoBlob(image.data);
				formData.append("file[]", blob, image.name);
			});

			return this.imageUploadService.uploadImages(formData)
				.pipe(
					map(response => response.images),
					map(images => setProperties(newObject, {images: [...imagePaths, ...images]}))
				)

		}

		return of(setProperties(newObject, {images: [...imagePaths]}));
	}

	/**
	 *
	 * @param {ShopItem} newObject
	 * @param {ModifiedImages} images
	 * @param previousValue
	 * @returns {Observable<ShopItem>}
	 */
	handleImages(newObject: ShopItem, images: ModifiedImages, previousValue: ShopItem = this.previousValue): Observable<ShopItem> {
		return this.deleteOldImages(images.imagePaths, previousValue)
			.pipe(
				mergeMap(() => this.uploadImage(newObject, images))
			)
	}

	/**
	 *
	 * @param {ShopItem} result
	 * @param {ModifyItemEvent} modifyItemEvent
	 * @returns {Observable<ShopItem>}
	 */
	handleStock(result: ShopItem, modifyItemEvent: ModifyItemEvent): Observable<ShopItem> {
		return (EventUtilityService.isMerchandise(result) && modifyItemEvent.stock)
			? (this.stockService.pushChanges(result, [...this.previousStock], [...modifyItemEvent.stock])
				.pipe(
					share(),
					tap(it => console.log(result)),
					map(() => result),
				))
			: of(result)
	}

	/**
	 *
	 * @param modifyItemEvent
	 */
	submitModifiedEvent(modifyItemEvent: ModifyItemEvent) {
		this.loading = true;

		const service: ServletServiceInterface<ShopItem | Event> = EventUtilityService.shopItemSwitch<ServletServiceInterface<ShopItem | Event>>(
			this.itemType,
			{
				merch: () => <ServletServiceInterface<ShopItem | Event>>this.eventService,
				tours: () => <ServletServiceInterface<ShopItem | Event>>this.eventService,
				partys: () => <ServletServiceInterface<ShopItem | Event>>this.eventService,
				members: () => <ServletServiceInterface<ShopItem | Event>>this.userService,
				entries: () => <ServletServiceInterface<ShopItem | Event>>this.entryService
			}
		);

		let newObject: ShopItem = modifyItemEvent.item;
		if (this.idOfObjectToModify && this.idOfObjectToModify >= 0) {
			newObject = setProperties(newObject, {id: this.idOfObjectToModify});
		}
		if (this.previousValue && EventUtilityService.isEvent(this.previousValue)) {
			newObject = setProperties(newObject, {
				groupPicture: this.previousValue.groupPicture,
				reportWriters: this.previousValue.reportWriters
			})
		}

		const isEditing = this.mode === ModifyType.EDIT;
		//handle addresses correctly
		const request = new TransactionBuilder<ShopItem>()
			.add(input => this.handleAddresses(input))
			.add(input => this.handleImages(input, modifyItemEvent.images))
			.add(input => isEditing
				? service.modify.bind(service)(input)
				: service.add.bind(service)(input))
			.add(input => this.handleStock(input, modifyItemEvent))
			.begin(newObject)
			.pipe(
				share(),
				first()
			);

		//perform request
		request
			.subscribe(
				(result: ShopItem) => {
					console.log(newObject);
					if (!this || this.itemType === undefined || !result) {
						const type = EventUtilityService.getShopItemType(newObject);
						this.navigationService.navigateToItemWithId(type, newObject.id);
						return;
					}

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
					if (error.status === 403) {
						this.matSnackBar.open("Du besitzt nicht die nötigen Rechte für diese Aktion.", "Schließen",
							{
								duration: 5000
							});
					}
					else if (error.status === 500) {
						this.matSnackBar.open("Beim Verarbeiten dieser Aktion ist leider ein Fehler aufgetreten.", "Schließen",
							{
								duration: 5000
							});
					}
					else if (error.status === 503 || error.status === 504) {
						this.matSnackBar.open("Der Server antwortet nicht.", "Schließen",
							{
								duration: 5000
							});
					}
					console.log("adding or editing object went wrong");
					console.error(error);
					console.log(newObject);
					this.loading = false;
				},
				() => {
					this.reset();
				}
			);

		//return request for additional error handling / whatever
		return request;
	}
}
