import {Injectable} from '@angular/core';
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {BankAccount} from "../../model/bank-account";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CacheStore} from "../../stores/cache.store";

interface UserBankAccountApiResponse {
	bankAccounts: BankAccount[];
}

@Injectable()
export class UserBankAccountService extends ServletService<BankAccount> {
	baseUrl = "/api/bankAccount";

	//todo select from bank account list when ordering (similar to address-selection maybe)
	//todo manage bank accounts somewhere (on user edit page?)
	constructor(public http: HttpClient,
				public userService: UserService,
				public cache: CacheStore) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<BankAccount>}
	 */
	getById(id: number): Observable<BankAccount> {
		if (this.cache.isCached("bankAccounts", id)) {
			console.log(`bankAccountId ${id} is cached`);
			return this.cache.cache.bankAccounts
				.map(bankAccounts => bankAccounts.find(bankAccount => bankAccount.id === id));
		}
		console.log(`bankAccountId ${id} is not cached, retrieving from db`);


		return this.http.get<UserBankAccountApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		})
			.map(response => response.bankAccounts[0])
			.do(bankAccount => this.cache.addOrModify(bankAccount))
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

		return this.http.get<UserBankAccountApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm)
		})
			.map(response => response.bankAccounts)
			.do(bankAccounts => this.cache.addMultiple(...bankAccounts))
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
		});
	}
}
