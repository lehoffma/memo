import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Event} from "../shared/model/event";
import {Direction, Sort} from "../../shared/model/api/sort";

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
	SortingOptionHelper.build(
		"Alphabetisch A-Z",
		Sort.by(Direction.ASCENDING, "title")
	),
	SortingOptionHelper.build(
		"Alphabetisch Z-A",
		Sort.by(Direction.DESCENDING, "title")
	),
	SortingOptionHelper.build(
		"Preis aufsteigend",
		Sort.by(Direction.ASCENDING, "price")
	),
	SortingOptionHelper.build(
		"Preis absteigend",
		Sort.by(Direction.DESCENDING, "price")
	),
	SortingOptionHelper.build(
		"Meilen aufsteigend",
		Sort.by(Direction.ASCENDING, "miles")
	),
	SortingOptionHelper.build(
		"Meilen absteigend",
		Sort.by(Direction.DESCENDING, "miles")
	),
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "date")
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "date")
	)
];
