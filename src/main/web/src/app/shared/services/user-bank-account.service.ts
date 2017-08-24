import {Injectable} from '@angular/core';
import {ServletService} from "./servlet.service";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, Response, URLSearchParams} from "@angular/http";
import {BankAccount} from "../model/bank-account";
import {UserService} from "./user.service";

@Injectable()
export class UserBankAccountService extends ServletService<BankAccount>{
	baseUrl = "/api/bankAccount";

	//todo select from bank account list when ordering (similar to address-selection maybe)
	//todo manage bank accounts somewhere (on user edit page?)
	constructor(public http:Http,
				public userService: UserService) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<BankAccount>}
	 */
	getById(id: number, ...args: any[]): Observable<BankAccount> {
		let queryParams = new URLSearchParams();
		queryParams.set("id", ""+id);

		return this.http.get(this.baseUrl, {search: queryParams})
			.map(response => response.json().bankAccounts[0] as BankAccount);
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @param options
	 * @returns {Observable<BankAccount[]>}
	 */
	search(searchTerm: string, options: {id:number, userId:number}): Observable<BankAccount[]> {
		if(options && options.id){
			return this.getById(options.id)
				.map(account => [account]);
		}
		if(options && options.userId){
			return this.getBankAccountsByUserId(options.userId);
		}

		let queryParams = new URLSearchParams();
		queryParams.set("searchTerm", searchTerm);

		return this.http.get(this.baseUrl, {search: queryParams})
			.map(response => response.json().accounts as BankAccount[]);
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<BankAccount[]>}
	 */
	getBankAccountsByUserId(userId:number):Observable<BankAccount[]>{
		return this.userService.getById(userId)
			.flatMap(user => Observable.combineLatest(...user.bankAccounts.map(id => this.getById(id))))
	}

	/**
	 *
	 * @param {BankAccount} account
	 * @param args
	 * @returns {Observable<BankAccount>}
	 */
	add(account: BankAccount, ...args: any[]): Observable<BankAccount> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.post(this.baseUrl, {account}, requestOptions)
			.map(response => response.json().id as number)
			.flatMap(accountId => this.getById(accountId));
	}

	/**
	 *
	 * @param {BankAccount} account
	 * @param args
	 * @returns {Observable<BankAccount>}
	 */
	modify(account: BankAccount, ...args: any[]): Observable<BankAccount> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.put(this.baseUrl, {account}, requestOptions)
			.map(response => response.json().id as number)
			.flatMap(accountId => this.getById(accountId));
	}

	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<Response>}
	 */
	remove(id: number, ...args: any[]): Observable<Response> {
		let params = new URLSearchParams();
		params.set("id", ""+id);
		return this.http.delete(this.baseUrl, {search: params});
	}
}
