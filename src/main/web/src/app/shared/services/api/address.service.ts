import {EventEmitter, Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Address, createAddress} from "../../model/address";
import {Observable} from "rxjs";
import {mergeMap, tap} from "rxjs/operators";
import {processInParallelAndWait, updateListOfItem} from "../../../util/observable-util";
import {User} from "../../model/user";
import {UserService} from "./user.service";
import {setProperties} from "../../model/util/base-object";


@Injectable()
export class AddressService extends ServletService<Address> {
	addressModificationDone: EventEmitter<Address> = new EventEmitter();
	redirectUrl: string;

	constructor(protected http: HttpClient,
				private userService: UserService) {
		super(http, "/api/address");
	}


	jsonToObject(json: any): Address {
		return setProperties(createAddress(), json);
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
	addOrModify(requestMethod: AddOrModifyRequest,
				address: Address): Observable<Address> {

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {address}, {
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
		const updateUserId = (address: Address, user: number): Address => setProperties(address, {user});

		return updateListOfItem<Address, User>(
			previousValue,
			addresses,
			user,
			"addresses",
			value => updateUserId(value, user.id),
			object => processInParallelAndWait(
				[...object.addresses.map(id => this.getById(id))]
			),
			value => this.add(value),
			value => this.modify(value),
			value => this.remove(value),
			object => this.userService.modify(object),
			id => this.getById(id)
		)
	}
}
