import {BaseObject} from "./util/base-object";

export interface BankAccount extends BaseObject {
	bankName: string;
	iban: string;
	bic: string;
	name: string;
}

export function createBankAccount(): BankAccount {
	return {
		id: -1,
		bankName: "",
		iban: "",
		bic: "",
		name: ""
	}
}
