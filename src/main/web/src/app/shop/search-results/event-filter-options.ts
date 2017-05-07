import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
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
