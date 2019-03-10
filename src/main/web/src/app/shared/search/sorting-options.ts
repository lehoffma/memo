import {SortingOption, SortingOptionHelper} from "../model/sorting-option";
import {Event} from "../../shop/shared/model/event";
import {Direction, Sort} from "../model/api/sort";

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
		Sort.by(Direction.ASCENDING, "title"),
		"A-Z"
	),
	SortingOptionHelper.build(
		"Alphabetisch Z-A",
		Sort.by(Direction.DESCENDING, "title"),
		"Z-A"
	),
	SortingOptionHelper.build(
		"Preis aufsteigend",
		Sort.by(Direction.ASCENDING, "price"),
		"Preis ↑"
	),
	SortingOptionHelper.build(
		"Preis absteigend",
		Sort.by(Direction.DESCENDING, "price"),
		"Preis ↓"
	),
	SortingOptionHelper.build(
		"Meilen aufsteigend",
		Sort.by(Direction.ASCENDING, "miles"),
		"Meilen ↑"
	),
	SortingOptionHelper.build(
		"Meilen absteigend",
		Sort.by(Direction.DESCENDING, "miles"),
		"Meilen ↓"
	),
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "date"),
		"Neu - Alt"
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "date"),
		"Alt - Neu"
	)
];
