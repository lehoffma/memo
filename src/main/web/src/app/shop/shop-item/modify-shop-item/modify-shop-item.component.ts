import {Component, OnInit} from "@angular/core";
import {EventService} from "../../../shared/services/event.service";
import {EntryService} from "../../../shared/services/entry.service";
import {Event} from "../../shared/model/event";
import {Entry} from "../../../shared/model/entry";
import {ShopItemType} from "../../shared/model/shop-item-type";
import {ModifyType} from "./modify-type";
import {User} from "../../../shared/model/user";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Params} from "@angular/router";
import {UserService} from "../../../shared/services/user.service";
import {ServletServiceInterface} from "../../../shared/model/servlet-service";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {Tour} from "../../shared/model/tour";
import {Merchandise} from "../../shared/model/merchandise";
import {Party} from "../../shared/model/party";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Location} from "@angular/common";
import {ShopItem} from "../../../shared/model/shop-item";
import {AddressService} from "../../../shared/services/address.service";
import {StockService} from "../../../shared/services/stock.service";
import * as moment from "moment";

@Component({
	selector: "memo-modify-shop-item",
	templateUrl: "./modify-shop-item.component.html",
	styleUrls: ["./modify-shop-item.component.scss"]
})
export class ModifyShopItemComponent implements OnInit {
	ModifyType = ModifyType;
	ItemType = ShopItemType;

	//either add or edit
	mode: ModifyType;

	//either merch, tour, party, user or entry
	itemType: ShopItemType;
	eventType: (ShopItemType);

	//wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	//ansonsten wird das übergebene Objekt editiert
	idOfObjectToModify: number;
	modifyingCostOfEvent = false;
	eventId: number = -1;

	previousValue: ShopItem;
	model: any = {};

	constructor(private eventService: EventService,
				private entryService: EntryService,
				private userService: UserService,
				private addressService: AddressService,
				private stockService: StockService,
				private navigationService: NavigationService,
				private location: Location,
				private activatedRoute: ActivatedRoute) {
		this.activatedRoute.params.first().subscribe(
			(params: Params) => {
				this.itemType = ShopItemType[ShopItemType[params["itemType"]]];
				this.eventId = +params["eventId"];
				if (this.eventId >= 0) {
					this.eventType = this.itemType;
					this.itemType = ShopItemType.entry;
				}

				this.idOfObjectToModify = params["id"] ? +(params["id"]) : -1;
			}
		);
		this.activatedRoute.queryParamMap.first().subscribe(queryParamMap => {
			if (queryParamMap.has("date")) {
				this.model["date"] = moment(queryParamMap.get("date")).toDate();
			}
			if(queryParamMap.has("eventId")){
				this.eventId = +queryParamMap.get("eventId");
			}
		})
	}

	/**
	 *
	 */
	ngOnInit() {
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

				//todo remove falls es ne bessere möglichkeit gibt..
				//extract addresses if we're editing a tour or a party
				if (this.itemType === ShopItemType.tour || this.itemType === ShopItemType.party) {
					let event: (Party | Tour) = (<(Party | Tour)>objectToModify);
					Observable.combineLatest(...event.route.map(routeStop => this.addressService.getById(routeStop)))
						.first()
						.subscribe(tourStops => {
							this.model["route"] = tourStops;
							if (objectToModify && objectToModify.id !== -1) {
								this.previousValue = objectToModify;
							}
						});
				}
				//extract the stock if we're editing a merchandise object
				else if (this.itemType === ShopItemType.merch) {
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
				else {
					//modus === EDIT
					if (objectToModify && objectToModify.id !== -1) {
						this.previousValue = objectToModify;
					}
				}
			});
			this.mode = ModifyType.EDIT;
		}
		else {
			this.mode = ModifyType.ADD;
		}
	}


	/**
	 * Cancel callback
	 */
	cancel() {
		this.location.back();
	}

	/**
	 * Submit callback
	 */
	submitModifiedObject(result:any) {
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

		let options: any = EventUtilityService.handleOptionalShopType(this.itemType,
			{
				entries: () => ({eventId: result["eventId"]})
			});


		//todo display "submitting..." while waiting for response from server
		let requestMethod = service.add.bind(service);
		if (this.mode === ModifyType.EDIT) {
			requestMethod = service.modify.bind(service);
		}
		requestMethod(newObject, options)
			.subscribe(
				(result: ShopItem) => {
					if(this.itemType === ShopItemType.entry){
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
				}
			);
	}
}
