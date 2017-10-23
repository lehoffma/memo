import {Injectable} from '@angular/core';
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Observable} from "rxjs/Rx";
import {Response} from "@angular/http";
import {BankAccount} from "../../model/bank-account";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

interface UserBankAccountApiResponse {
	bankAccounts: BankAccount[];
}

@Injectable()
export class UserBankAccountService extends ServletService<BankAccount> {
	baseUrl = "/api/bankAccount";

	//todo select from bank account list when ordering (similar to address-selection maybe)
	//todo manage bank accounts somewhere (on user edit page?)
	constructor(public http: HttpClient,
				public userService: UserService) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<BankAccount>}
	 */
	getById(id: number): Observable<BankAccount> {
		const params = new HttpParams().set("id", "" + id);
		const request = this.http.get<UserBankAccountApiResponse>(this.baseUrl, {params})
			.map(response => response.bankAccounts[0]);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @param options
	 * @returns {Observable<BankAccount[]>}
	 */
	search(searchTerm: string, options: { id: number, userId: number }): Observable<BankAccount[]> {
		if (options && options.id) {
			return this.getById(options.id)
				.map(account => [account]);
		}
		if (options && options.userId) {
			return this.getBankAccountsByUserId(options.userId);
		}

		const params = new HttpParams().set("searchTerm", searchTerm);
		const request = this.http.get<UserBankAccountApiResponse>(this.baseUrl, {params})
			.map(response => response.bankAccounts);

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<BankAccount[]>}
	 */
	getBankAccountsByUserId(userId: number): Observable<BankAccount[]> {
		return this.userService.getById(userId)
			.flatMap(user => Observable.combineLatest(...user.bankAccounts.map(id => this.getById(id))))
	}

	/**
	 *
	 * @param {BankAccount} account
	 * @param args
	 * @returns {Observable<BankAccount>}
	 */
	add(account: BankAccount): Observable<BankAccount> {
		return this.http.post<AddOrModifyResponse>(this.baseUrl, {account}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.do(() => this._cache.invalidateById(account.id))
			.flatMap(response => this.getById(response.id));
	}

	/**
	 *
	 * @param {BankAccount} account
	 * @param args
	 * @returns {Observable<BankAccount>}
	 */
	modify(account: BankAccount): Observable<BankAccount> {
		return this.http.put<AddOrModifyResponse>(this.baseUrl, {account}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.do(() => this._cache.invalidateById(account.id))
			.flatMap(response => this.getById(response.id));
	}

	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<Response>}
	 */
	remove(id: number): Observable<Response> {
		return this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		})
			.do(() => this._cache.invalidateById(id))
	}
}
