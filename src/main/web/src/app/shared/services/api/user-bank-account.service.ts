import {Injectable} from "@angular/core";
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Response} from "@angular/http";
import {BankAccount} from "../../model/bank-account";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {filter, map, mergeMap, share, take, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {User} from "../../model/user";
import {Address} from "../../model/address";
import {processInParallelAndWait, processSequentially, processSequentiallyAndWait} from "../../../util/observable-util";
import {isEdited} from "../../../util/util";
import {of} from "rxjs/observable/of";

interface UserBankAccountApiResponse {
	bankAccounts: BankAccount[];
}

@Injectable()
export class UserBankAccountService extends ServletService<BankAccount> {
	baseUrl = "/api/bankAccount";

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


	/**
	 *
	 * @param {Address[]} previousValue
	 * @param {Address[]} accounts
	 * @param user
	 */
	public updateAccountsOfUser(previousValue: BankAccount[], accounts: BankAccount[], user: User): Observable<BankAccount[]> {

		let addedAccounts = [];
		let removedAccounts = [];
		let editedAccounts = [];
		//both arrays are the same length => nothing has changed or something was edited
		//accounts < previousValue => something was removed
		if (previousValue.length === accounts.length) {
			const index = previousValue.findIndex(it =>
				!!accounts.find(prev => isEdited(prev, it, ["id"]))
			);
			if (index >= 0) {
				editedAccounts.push(previousValue[index]);
			}
			//otherwise, nothing changed
		}
		//something was added
		else if (previousValue.length < accounts.length) {
			//find the address that is part of accounts, but not of previousValue
			const index = accounts.findIndex(it =>
				//there is no address in prevValues that is equal to the one that is being checked here
				!previousValue.find(prev => !isEdited(it, prev, ["id"]))
			);

			addedAccounts.push(accounts[index]);
		}
		else if (previousValue.length > accounts.length) {
			//find the address that is part of previousValue, but not of accounts
			const index = previousValue.findIndex(it =>
				//there is no address in accounts that is equal to the one that is being checked here
				!accounts.find(prev => !isEdited(it, prev, ["id"]))
			);

			removedAccounts.push(previousValue[index]);
		}


		const addRequests = addedAccounts.map(it => this.add(it));
		const removeRequests = removedAccounts.map(it => this.remove(it.id));
		const editRequests = editedAccounts.map(it => this.modify(it));

		const combined = [
			...addRequests,
			...removeRequests,
			...editRequests,
		];
		if (combined.length === 0) {
			return processInParallelAndWait(user.addresses.map(id => this.getById(id)));
		}

		return processSequentiallyAndWait(
			combined
		)
			.pipe(
				take(1),
				share(),
				mergeMap(result => {
					if (!result || result.length === 0) {
						return of([]);
					}

					let newAccounts = [];
					if (addRequests.length > 0) {
						newAccounts.push(...result.slice(0, addRequests.length));
					}
					if (editRequests.length > 0) {
						newAccounts.push(...result.slice(
							addRequests.length + removeRequests.length));
					}

					const accountIds = newAccounts.map(it => it.id);
					accountIds.push(...user.bankAccounts
						.filter(id => !removedAccounts.find(removed => removed.id === id))
					);

					return this.userService.modify(user.setProperties({
						bankAccounts: accountIds
					}))
						.pipe(mergeMap(user => {
							if (accountIds.length === 0) {
								return of([]);
							}
							return combineLatest(...accountIds.map(id => this.getById(id)))
								.pipe(filter(it => it.length === accountIds.length), take(1))
						}))
				})
			)
	}
}
