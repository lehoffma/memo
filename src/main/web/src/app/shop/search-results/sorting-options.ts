import {SortingOption} from "../../shared/model/sorting-option";
import {Event} from "../shared/model/event";

/**
 * Alphabetisch A-Z
 * Alphabetisch Z-A
 * Preis aufsteigend
 * Preis absteigend
 * Datum neueste - älteste
 * Datum älteste - neueste
 * Meilen aufsteigend/absteigend
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
	},
	{
		name: "Alphabetisch Z-A",
		queryParameters: {
			sortBy: "title",
			descending: "true"
		}
	},
	{
		name: "Preis aufsteigend",
		queryParameters: {
			sortBy: "price",
			descending: "false"
		}
	},
	{
		name: "Preis absteigend",
		queryParameters: {
			sortBy: "price",
			descending: "true"
		}
	},
	{
		name: "Meilen aufsteigend",
		queryParameters: {
			sortBy: "miles",
			descending: "false"
		}
	},
	{
		name: "Meilen absteigend",
		queryParameters: {
			sortBy: "miles",
			descending: "true"
		}
	},
	{
		name: "Datum neueste - älteste",
		queryParameters: {
			sortBy: "date",
			descending: "false"
		}
	},
	{
		name: "Datum älteste - neueste",
		queryParameters: {
			sortBy: "date",
			descending: "true"
		}
	}
];
