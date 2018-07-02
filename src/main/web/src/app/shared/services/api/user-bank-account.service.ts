import {Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Response} from "@angular/http";
import {BankAccount} from "../../model/bank-account";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {mergeMap, tap} from "rxjs/operators";
import {User} from "../../model/user";
import {Address} from "../../model/address";
import {processInParallelAndWait, updateListOfItem} from "../../../util/observable-util";


@Injectable()
export class UserBankAccountService extends ServletService<BankAccount> {
	constructor(public http: HttpClient,
				public userService: UserService) {
		super(http, "/api/bankAccount");
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: BankAccount, options?: any): Observable<BankAccount> {
		return requestMethod<AddOrModifyResponse>(this.baseUrl, {account: entry}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.pipe(
				tap(() => this._cache.invalidateById(entry.id)),
				mergeMap(response => this.getById(response.id))
			);
	}


	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<Response>}
	 */
	remove(id: number): Observable<Object> {
		return this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		})
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}


	/**
	 *
	 * @param {Address[]} previousValue
	 * @param {Address[]} accounts
	 * @param user
	 */
	public updateAccountsOfUser(previousValue: BankAccount[], accounts: BankAccount[], user: User): Observable<BankAccount[]> {
		return updateListOfItem<BankAccount, User>(
			previousValue,
			accounts,
			user,
			"bankAccounts",
			value => value,
			object => processInParallelAndWait(
				[...object.bankAccounts.map(id => this.getById(id))]
			),
			value => this.add(value),
			value => this.modify(value),
			value => this.remove(value),
			object => this.userService.modify(object),
			id => this.getById(id)
		)
	}
}
