import {Component, OnInit} from "@angular/core";
import {EventService} from "../../shared/services/event.service";
import {EntryService} from "../../shared/services/entry.service";
import {Event} from "../shared/model/event";
import {Entry} from "../../shared/model/entry";
import {ShopItemType} from "../shared/model/shop-item-type";
import {ModifyType} from "./modify-type";
import {ItemFormType} from "./item-form-type";
import {EditItemFormList, ItemFormList} from "./edit-item-form-list";
import {User} from "../../shared/model/user";
import {EventType} from "../shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Params} from "@angular/router";
import {UserService} from "../../shared/services/user.service";
import {ServletService} from "../../shared/model/servlet-service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Tour} from "../shared/model/tour";
import {Merchandise} from "../shared/model/merchandise";
import {Party} from "../shared/model/party";
import {NavigationService} from "../../shared/services/navigation.service";
import {ListFormType} from "app/shop/modify-shop-item/list-form-type";
import {Location} from "@angular/common";

type Item = User | Entry | Merchandise | Tour | Party;

@Component({
	selector: "memo-modify-shop-item",
	templateUrl: "./modify-shop-item.component.html",
	styleUrls: ["./modify-shop-item.component.scss"]
})
export class ModifyShopItemComponent implements OnInit {
	ModifyType = ModifyType;
	ItemFormType = ItemFormType;
	ListFormType = ListFormType;
	editItemFormList: ItemFormList = EditItemFormList;

	//either add or edit
	mode: ModifyType;

	//either merch, tour, party or entry (maybe even user?)
	itemType: ShopItemType;

	//wenn id === -1 oder undefined, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	//ansonsten wird das übergebene Objekt editiert
	idOfObjectToModify: number;

	previousValue: Item;
	model: any = {};

	constructor(private eventService: EventService,
				private entryService: EntryService,
				private userService: UserService,
				private navigationService: NavigationService,
				private eventUtilService: EventUtilityService,
				private location: Location,
				private activatedRoute: ActivatedRoute) {
		this.activatedRoute.params.first().subscribe(
			(params: Params) => {
				this.itemType = ShopItemType[ShopItemType[params["itemType"]]];
				this.idOfObjectToModify = params["id"] ? +(params["id"]) : -1;
			}
		);
	}

	ngOnInit() {
		if (this.idOfObjectToModify !== -1) {
			let objectToModifyObservable: Observable<Event | Entry | User> = this.eventUtilService.handleOptionalShopType(
				this.itemType,
				{
					merch: () => this.eventService.getById(this.idOfObjectToModify, {eventType: EventType.merch}),
					tours: () => this.eventService.getById(this.idOfObjectToModify, {eventType: EventType.tours}),
					partys: () => this.eventService.getById(this.idOfObjectToModify, {eventType: EventType.partys}),
					members: () => this.userService.getById(this.idOfObjectToModify),
					entries: () => this.entryService.getById(this.idOfObjectToModify),
				});

			//initialize model with object
			objectToModifyObservable.first().subscribe(objectToModify => {
				Object.keys(objectToModify).forEach(key => this.model[key] = objectToModify[key]);
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

	cancel() {
		console.log("cancel");
		this.location.back();
	}

	submitModifiedObject() {
		let service: ServletService<User | Entry | Event> = this.eventUtilService.handleOptionalShopType<ServletService<User | Entry | Event>>(
			this.itemType,
			{
				merch: () => this.eventService,
				tours: () => this.eventService,
				partys: () => this.eventService,
				members: () => this.userService,
				entries: () => this.entryService
			}
		);
		let newObject: User | Entry | Merchandise | Tour | Party = this.eventUtilService.handleOptionalShopType<User | Entry | Event>(
			this.itemType,
			{
				merch: () => Merchandise.create().setProperties(this.model),
				tours: () => Tour.create().setProperties(this.model),
				partys: () => Party.create().setProperties(this.model),
				members: () => User.create().setProperties(this.model),
				entries: () => Entry.create().setProperties(this.model)
			}
		);

		service.addOrModify(newObject)
			.subscribe(
				(result: Event) => {
					//navigiere zum neu erstellten item
					this.navigationService.navigateToItem(result);
				},
				error => {
					console.log("adding or editing object went wrong");
					console.error(error);
					console.log(newObject);
				}
			);
	}
}
