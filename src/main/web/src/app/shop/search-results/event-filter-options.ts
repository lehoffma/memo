import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
import {ShopItem} from "../../shared/model/shop-item";
import {Tour} from "../shared/model/tour";
import {Merchandise} from "../shared/model/merchandise";
import {Party} from "../shared/model/party";
export const eventFilterOptions: MultiLevelSelectParent[] = [
	{
		name: "Kategorie",
		queryKey: "category",
		selectType: "multiple",
		expanded: false,
		children: [
			{
				name: "Fahrten",
				queryValue: "tours",
				selected: false
			},
			{
				name: "Veranstaltungen",
				queryValue: "partys",
				selected: false
			},
			{
				name: "Merchandise",
				queryValue: "merch",
				selected: false
			}
			//	todo: add entries + user to search filters?
		]
	},
	{
		name: "Preis",
		queryKey: "price",
		expanded: false,
		selectType: "single",
		children: [
			{
				name: "Unter 10 Euro",
				queryValue: "below10",
				selected: false
			},
			{
				name: "10 bis 50 Euro",
				queryValue: "between10and50",
				selected: false
			},
			{
				name: "50 bis 100 Euro",
				queryValue: "between50and100",
				selected: false
			},
			{
				name: "Über 100 Euro",
				queryValue: "moreThan100",
				selected: false
			}
		]
	},
	{
		name: "Farbe",
		queryKey: "color",
		selectType: "multiple",
		expanded: false,
		children: [
			{
				name: "Weiss",
				queryValue: "white",
				selected: false
			},
			{
				name: "Blau",
				queryValue: "blue",
				selected: false
			},
			{
				name: "Grün",
				queryValue: "green",
				selected: false
			}
		]
	},
];

function isMerchandise(event: any): event is Merchandise {
	return event && (<Merchandise>event).colors !== undefined;
}

function isTour(event: any): event is Tour {
	return event && (<Tour>event).vehicle !== undefined
}

function isParty(event: any): event is Party {
	return event && (<Party>event).emptySeats !== undefined && (<Tour>event).vehicle === undefined;
}

export const filterFunctions: {
	[key: string]: (obj: ShopItem, filterValue: any) => boolean
} = {
	"category": (item, filterValue) => {
		if (isMerchandise(item) || isTour(item) || isParty(item)) {
			return //todo
		}
		return true;
	}

}
