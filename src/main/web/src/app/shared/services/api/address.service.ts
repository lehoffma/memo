import {EventEmitter, Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Address} from "../../model/address";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, share, take, tap} from "rxjs/operators";
import {processInParallelAndWait, processSequentiallyAndWait} from "../../../util/observable-util";
import {isEdited} from "../../../util/util";
import {User} from "../../model/user";
import {UserService} from "./user.service";
import {of} from "rxjs/observable/of";

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
	 * @param user
	 */
	public updateAddressesOfUser(previousValue: Address[], addresses: Address[], user: User): Observable<Address[]> {
		const updateUserId = (address: Address, user: number): Address => address.setProperties({user});

		let addedAddresses = [];
		let removedAddresses = [];
		let editedAddresses = [];
		//both arrays are the same length => nothing has changed or something was edited
		//addresses < previousValue => something was removed
		if (previousValue.length === addresses.length) {
			const index = previousValue.findIndex(it =>
				!!addresses.find(prev => isEdited(prev, it, ["id"]))
			);
			if (index >= 0) {
				editedAddresses.push(previousValue[index]);
			}
			//otherwise, nothing changed
		}
		//something was added
		else if (previousValue.length < addresses.length) {
			//find the address that is part of addresses, but not of previousValue
			const index = addresses.findIndex(it =>
				//there is no address in prevValues that is equal to the one that is being checked here
				!previousValue.find(prev => !isEdited(it, prev, ["id"]))
			);

			addedAddresses.push(addresses[index]);
		}
		else if (previousValue.length > addresses.length) {
			//find the address that is part of previousValue, but not of addresses
			const index = previousValue.findIndex(it =>
				//there is no address in addresses that is equal to the one that is being checked here
				!addresses.find(prev => !isEdited(it, prev, ["id"]))
			);

			removedAddresses.push(previousValue[index]);
		}

		const addRequests = addedAddresses
			.map(it => updateUserId(it, user.id))
			.map(it => this.add(it));
		const removeRequests = removedAddresses
			.map(it => updateUserId(it, user.id))
			.map(it => this.remove(it.id));
		const editRequests = editedAddresses
			.map(it => updateUserId(it, user.id))
			.map(it => this.modify(it));

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


					let newAddresses = [];
					if (addRequests.length > 0) {
						newAddresses.push(...result.slice(0, addRequests.length));
					}
					if (editRequests.length > 0) {
						newAddresses.push(...result.slice(
							addRequests.length + removeRequests.length));
					}

					let addressIds = newAddresses.map(it => it.id);
					addressIds.push(...user.addresses
						.filter(id => !removedAddresses.find(removed => removed.id === id))
					);
					addressIds = addressIds.filter((value, index, array) => array.indexOf(value) === index);

					if (user.addresses.every(id => addressIds.find(it => it === id))) {
						return processInParallelAndWait([...addressIds.map(it => this.getById(it))]);
					}

					return this.userService.modify(user.setProperties({
						addresses: addressIds
					}))
						.pipe(mergeMap(() =>
							processInParallelAndWait([...addressIds.map(it => this.getById(it))])
						))
				})
			)
	}
}
