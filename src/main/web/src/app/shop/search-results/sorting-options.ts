import {SortingOption} from "../../shared/model/sorting-option";
import {Event} from "../shared/model/event";
import {attributeSortingFunction} from "../../util/util";

/**
 * Alphabetisch A-Z
 * Alphabetisch Z-A
 * Preis aufsteigend
 * Preis absteigend
 * Datum neueste - älteste
 * Datum älteste - neueste
 * todo mehr fällt mir nich ein
 *
 * @type {[{name}]}
 */
export const eventSortingOptions: SortingOption<Event>[] = [
	{
		name: "Alphabetisch A-Z",
		queryParameters: {
			sortBy: "title",
			descending: "false"
		},
		//todo: wird sortingFunction überhaupt benötigt?
		sortingFunction: attributeSortingFunction("title", false)
	},
	{
		name: "Alphabetisch Z-A",
		queryParameters: {
			sortBy: "title",
			descending: "true"
		},
		sortingFunction: attributeSortingFunction("title", true)
	},
	{
		name: "Preis aufsteigend",
		queryParameters: {
			sortBy: "price",
			descending: "false"
		},
		sortingFunction: attributeSortingFunction("price", false)
	},
	{
		name: "Preis absteigend",
		queryParameters: {
			sortBy: "price",
			descending: "true"
		},
		sortingFunction: attributeSortingFunction("price", true)
	},
	{
		name: "Datum neueste - älteste",
		queryParameters: {
			sortBy: "date",
			descending: "false"
		},
		sortingFunction: attributeSortingFunction("date", false)
	},
	{
		name: "Datum älteste - neueste",
		queryParameters: {
			sortBy: "date",
			descending: "true"
		},
		sortingFunction: attributeSortingFunction("date", true)
	}
];
