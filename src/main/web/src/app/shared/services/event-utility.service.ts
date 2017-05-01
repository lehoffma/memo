import {Injectable} from "@angular/core";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Event} from "../../shop/shared/model/event";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {isNullOrUndefined} from "util";
import {EventType} from "../../shop/shared/model/event-type";
import {User} from "../model/user";
import {Entry} from "../model/entry";
import {ShopItemType} from "../../shop/shared/model/shop-item-type";


@Injectable()
export class EventUtilityService {

	constructor() {
	}

	getEventType(event: Event): EventType {
		return this.handleShopItem(event,
			merch => EventType.merch,
			tour => EventType.tours,
			party => EventType.partys,
			user => null,
			entry => null,
			error => {
				console.error(`Could not deduce type from event ${error}`);
				return null;
			});
	}

	getShopItemType(item: Event | User | Entry): ShopItemType {
		return this.handleShopItem(item,
			merch => ShopItemType.merch,
			tour => ShopItemType.tour,
			party => ShopItemType.party,
			user => ShopItemType.user,
			entry => ShopItemType.entry,
			error => {
				console.error(`Could not deduce type from event ${error}`);
				return null;
			});
	}

	handleShopItem<T>(item: Event | User | Entry,
					  merchCallback: (merch: Merchandise) => T,
					  tourCallback: (tour: Tour) => T,
					  partyCallback: (party: Party) => T,
					  userCallback: (user: User) => T,
					  entryCallback: (entry: Entry) => T,
					  defaultCallback: (event: typeof item) => T = () => null): T {
		if (isNullOrUndefined(item)) {
			return defaultCallback(item);
		}
		if (this.isMerchandise(item)) {
			return merchCallback(item);
		}
		if (this.isTour(item)) {
			return tourCallback(item);
		}
		if (this.isParty(item)) {
			return partyCallback(item);
		}
		if (this.isUser(item)) {
			return userCallback(item);
		}
		//todo implement isEntry
		// if (this.isEntry(item)) {
		// 	return entryCallback(item);
		// }
		return defaultCallback(item);
	}

	isUser(event: any): event is User {
		return event && (<User>event).email !== undefined;
	}

	isMerchandise(event: any): event is Merchandise {
		return event && (<Merchandise>event).colors !== undefined;
	}

	isTour(event: any): event is Tour {
		return event && (<Tour>event).vehicle !== undefined
	}

	isParty(event: any): event is Party {
		return event && (<Party>event).emptySeats !== undefined && (<Tour>event).vehicle === undefined;
	}
}
