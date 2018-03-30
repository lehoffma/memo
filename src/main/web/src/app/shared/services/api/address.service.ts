import {EventEmitter, Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Address} from "../../model/address";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {processSequentially} from "../../../util/observable-util";
import {isEdited} from "../../../util/util";
import {User} from "../../model/user";
import {UserService} from "./user.service";

interface AddressApiResponse {
	addresses: Partial<Address>[]
}

@Injectable()
export class AddressService extends ServletService<Address> {
	baseUrl = "/api/address";
	addressModificationDone: EventEmitter<Address> = new EventEmitter();
	redirectUrl: string;

	constructor(private http: HttpClient,
				private userService: UserService) {
		super();
	}


	/**
	 * Requested die Addresse vom Server, welche die gegebene ID besitzt
	 * @param id
	 * @returns {any}
	 */
	getById(id: number): Observable<Address> {
		const params = new HttpParams().set("id", "" + id);
		const request = this.performRequest(this.http.get<AddressApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(json => Address.create().setProperties(json.addresses[0]))
			);

		return this._cache.getById(params, request)
	}

	/**
	 * Requested alle Addressen die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<Address[]> {
		const params = new HttpParams().set("searchTerm", "" + searchTerm);
		const request = this.performRequest(this.http.get<AddressApiResponse>(this.baseUrl, {params}))
			.pipe(
				map((json) => json.addresses.map(json => Address.create().setProperties(json)))
			);

		return this._cache.search(params, request);
	}

	/**
	 * @param address
	 * @returns {Observable<T>}
	 */
	add(address: Address): Observable<Address> {
		return this.addOrModify(this.http.post.bind(this.http), address);
	}

	/**
	 *
	 * @param address
	 * @returns {Observable<Address>}
	 */
	modify(address: Address): Observable<Address> {
		return this.addOrModify(this.http.put.bind(this.http), address);
	}

	/**
	 *
	 * @param id
	 * @returns {Observable<T>}
	 */
	remove(id: number): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		}))
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param address
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: AddOrModifyRequest,
						address: Address): Observable<Address> {

		return this.performRequest(requestMethod<AddOrModifyResponse>("/api/address", {address}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(() => this._cache.invalidateById(address.id)),
				mergeMap(json => this.getById(json.id)),
				tap(address => this.addressModificationDone.emit(address))
			);
	}


	/**
	 *
	 * @param {Address[]} previousValue
	 * @param {Address[]} addresses
	 * @param user$
	 */
	public updateAddressesOfUser(previousValue: Address[], addresses: Address[], user$: Observable<User>): Observable<User> {
		const addedAddresses = addresses.filter(it => it.id === -1);
		const removedAddresses = previousValue.filter(address => !addresses.find(it => address.id === it.id));
		const editedAddresses = addresses
			.filter(newAddr => {
				return previousValue.find(prevAddr =>
					prevAddr.id === newAddr.id && (isEdited(newAddr, prevAddr, ["id"]))
				)
			});

		const addRequests = addedAddresses.map(it => this.add(it));
		const removeRequests = removedAddresses.map(it => this.remove(it.id));
		const editRequests = editedAddresses.map(it => this.modify(it));

		return processSequentially(
			[
				...addRequests,
				...removeRequests,
				...editRequests,
			]
		)
			.pipe(
				mergeMap(result => {
					if (!result || result.length === 0) {
						return user$;
					}

					let newAddresses = [];
					if (addRequests.length > 0) {
						newAddresses.push(...result.slice(0, addRequests.length));
					}
					if (editRequests.length > 0) {
						newAddresses.push(...result.slice(
							addRequests.length + removeRequests.length));
					}


					return user$
						.pipe(mergeMap(user => {
							const addressIds = newAddresses.map(it => it.id);
							addressIds.push(...user.addresses
								.filter(id => !removedAddresses.find(removed => removed.id === id))
							);

							return this.userService.modify(user.setProperties({
								addresses: addressIds
							}))
						}))
				})
			)
	}
}
