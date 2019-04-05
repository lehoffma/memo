import {ClubRole} from "../../../shared/model/club-role";
import {BaseObject} from "../../../shared/model/util/base-object";
import {EventRoute} from "./route";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {EventOverviewKey} from "../../shop-item/item-details/info/event-overview-key";
import {PaymentMethod} from "../../checkout/payment/payment-method";

export interface PaymentConfig {
	limit: number;
	methods: {
		[method in PaymentMethod]: boolean;
	}
}

export interface Event extends BaseObject {
	title: string;
	date: Date;
	description: string;
	author: number[];
	reportWriters?: number[];
	expectedReadRole: ClubRole;
	expectedCheckInRole: ClubRole;
	expectedWriteRole: ClubRole;
	paymentLimit: number;
	paymentMethods: PaymentMethod[];
	route: EventRoute;
	images: string[];
	groupPicture: string;
	capacity: number;
	price: number;
	type: number;
}

//alias because intellij won't import the correct version of the event interface otherwise
export type ShopEvent = Event;

export function paymentConfig(event: Event): PaymentConfig {
	let methods = {
		[PaymentMethod.CASH]: true,
		[PaymentMethod.TRANSFER]: true,
		[PaymentMethod.DEBIT]: true
	};
	if (event.paymentMethods) {
		methods = event.paymentMethods.reduce((acc, method) => ({...acc, [method]: true}), {});
	}

	return {
		limit: event.paymentLimit || -1,
		methods
	};
}

export function maximumItemAmount(event: Event, amount: number): number {
	const limit = paymentConfig(event).limit;
	if (limit > 0) {
		return Math.min(limit, amount);
	}
	return amount;
}

export function getOverviewKeys(event: any): EventOverviewKey[] {
	return EventUtilityService.optionalShopItemSwitch(event, {
		tours: () => [
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			{
				key: "miles",
				label: "Meilen"
			}
		],
		merch: () => [
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "material",
				label: "Material",
			},
			{
				key: "capacity",
				label: "Auf Lager",
			},
		],
		partys: () => [
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
		]
	})
}

export function getDetailsTableKeys(event: any) {
	EventUtilityService.optionalShopItemSwitch(event, {
		tours: () => [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Maximale Teilnehmeranzahl"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			{
				key: "miles",
				label: "Meilen"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "vehicle",
				label: "Fahrzeug"
			},

		],
		merch: () => [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Auf Vorrat"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "material",
				label: "Material"
			}
		],
		partys: () => [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Maximale Teilnehmeranzahl"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			}
		]
	})
}
