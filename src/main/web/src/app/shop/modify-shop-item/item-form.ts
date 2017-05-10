import {ItemFormType} from "./item-form-type";
export class ItemForm {
	constructor(public key: string,
				public title: string,
				public type: ItemFormType,
				public required: boolean) {

	}
}
