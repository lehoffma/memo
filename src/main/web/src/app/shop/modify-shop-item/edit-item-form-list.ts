import {ItemFormType} from "./item-form-type";
import {ItemForm} from "./item-form";
export type ItemFormList = {
	//	this will work in the future..
	// [P in ShopItemType]: ItemForm[];
	merch: ItemForm[];
	tours: ItemForm[];
	partys: ItemForm[];
	members: ItemForm[];
	entries: ItemForm[];
}


export const EditItemFormList: ItemFormList = {
	merch: [
		new ItemForm("title", "Name", ItemFormType.TEXT, true),
		new ItemForm("description", "Beschreibung", ItemFormType.TEXT_AREA, true),
		new ItemForm("expectedRole", "Wer darf dies sehen?", ItemFormType.ROLE_LIST, true),
		new ItemForm("price", "Preis", ItemFormType.NUMBER, true),
		new ItemForm("capacity", "Vorrat", ItemFormType.NUMBER, true),
		new ItemForm("material", "Material", ItemFormType.TEXT, true),
		new ItemForm("colors", "Farben", ItemFormType.COLOR_LIST, true),
		new ItemForm("sizes", "Größen", ItemFormType.TEXT_LIST, true)
	],
	tours: [
		new ItemForm("title", "Name", ItemFormType.TEXT, true),
		new ItemForm("description", "Beschreibung", ItemFormType.TEXT_AREA, true),
		new ItemForm("route", "Route", ItemFormType.GOOGLE_MAPS_AUTOFILL, true),
		new ItemForm("date", "Datum", ItemFormType.DATE, true),
		new ItemForm("expectedRole", "Wer darf dies sehen?", ItemFormType.ROLE_LIST, true),
		new ItemForm("price", "Preis", ItemFormType.NUMBER, true),
		new ItemForm("capacity", "Maximale Anzahl an Teilnehmern", ItemFormType.NUMBER, true),
		//todo: text list stattdessen?
		new ItemForm("vehicle", "Fahrzeug", ItemFormType.TEXT, true),
	],
	partys: [
		new ItemForm("title", "Name", ItemFormType.TEXT, true),
		new ItemForm("description", "Beschreibung", ItemFormType.TEXT_AREA, true),
		new ItemForm("meetingPoint", "Treffpunkt", ItemFormType.GOOGLE_MAPS_AUTOFILL, true),
		new ItemForm("date", "Datum", ItemFormType.DATE, true),
		new ItemForm("expectedRole", "Wer darf dies sehen?", ItemFormType.ROLE_LIST, true),
		new ItemForm("price", "Preis", ItemFormType.NUMBER, true),
		new ItemForm("capacity", "Maximale Anzahl an Teilnehmern", ItemFormType.NUMBER, true),
	],
	members: [
		//todo
	],
	entries: [
		//todo noch keine ahnung da kein model vorhanden
	]
};
