import {Component, Input, OnInit} from "@angular/core";
import {EventService} from "../../shared/services/event.service";
import {EntryService} from "../../shared/services/entry.service";
import {Event} from "../shared/model/event";
import {Entry} from "../../shared/model/entry";
import {ShopItemType} from "../shared/model/shop-item-type";

@Component({
	selector: "memo-modify-shop-item",
	templateUrl: "./modify-shop-item.component.html",
	styleUrls: ["./modify-shop-item.component.scss"]
})
export class ModifyShopItemComponent implements OnInit {

	//either add or edit
	mode;

	//either merch, tour, party or entry (maybe even user?)
	itemType: ShopItemType;

	//model input. wenn id des inputs === -1, ist mode === ADD (da ein leeres Objekt übergeben wurde),
	//ansonsten wird das übergebene Objekt editiert
	@Input() objectToModify: Event | Entry;


	constructor(private eventService: EventService,
				private entryService: EntryService) {
	}

	ngOnInit() {
	}

}
