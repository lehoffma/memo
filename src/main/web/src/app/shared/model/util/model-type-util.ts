import {Address} from "../address";
import {BankAccount} from "../bank-account";
import {Entry} from "../entry";
import {EntryCategory} from "../entry-category";
import {Order} from "../order";
import {User} from "../user";
import {Comment} from "../../../shop/shared/model/comment";

export function isAddress(obj: any): obj is Address {
	return obj && obj.street !== undefined && obj.zip !== undefined;
}

export function isBankAccount(object: any): object is BankAccount {
	return object && (<BankAccount>object).iban !== undefined && (<BankAccount>object).iban !== null;
}


export function isEntry(entry: any): entry is Entry {
	return entry && (<Entry>entry).name !== undefined && (<Entry>entry).value !== undefined;
}

export function isEntryCategory(object: any): object is EntryCategory {
	return object && object["id"] !== undefined && object["name"] !== undefined;
}

export function isOrder(object: any): object is Order {
	return object && (<Order>object).method !== undefined && (<Order>object).method !== null;
}

export function isUser(user: any): user is User {
	return user && (<User>user).email !== undefined;
}

export function isComment(value: any): value is Comment {
	return value && (<Comment>value).timeStamp !== undefined;
}
