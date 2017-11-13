import {Injectable} from '@angular/core';
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Response} from "@angular/http";
import {BankAccount} from "../../model/bank-account";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

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
			.pipe(
				map(it => it.bankAccounts[0])
			);

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
				.pipe(
					map(account => [account])
				);
		}
		if (options && options.userId) {
			return this.getBankAccountsByUserId(options.userId);
		}

		const params = new HttpParams().set("searchTerm", searchTerm);
		const request = this.http.get<UserBankAccountApiResponse>(this.baseUrl, {params})
			.pipe(
				map(response => response.bankAccounts)
			);

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<BankAccount[]>}
	 */
	getBankAccountsByUserId(userId: number): Observable<BankAccount[]> {
		return this.userService.getById(userId)
			.pipe(
				mergeMap(user => combineLatest(...user.bankAccounts.map(id => this.getById(id))))
			);
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
			.pipe(
				tap(() => this._cache.invalidateById(account.id)),
				mergeMap(response => this.getById(response.id))
			);
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
			.pipe(
				tap(() => this._cache.invalidateById(account.id)),
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
}
