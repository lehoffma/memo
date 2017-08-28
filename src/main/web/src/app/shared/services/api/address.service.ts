import {EventEmitter, Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CacheStore} from "../../stores/cache.store";
import {Address} from "../../model/address";

interface AddressApiResponse {
	addresses: Partial<Address>[]
}

@Injectable()
export class AddressService extends ServletService<Address> {
	baseUrl = "/api/address";
	addressModificationDone: EventEmitter<Address> = new EventEmitter();
	redirectUrl: string;

	constructor(private http: HttpClient,
				private cache: CacheStore,) {
		super();
	}


	/**
	 * Requested die Addresse vom Server, welche die gegebene ID besitzt
	 * @param id
	 * @returns {any}
	 */
	getById(id: number): Observable<Address> {
		//if the user is stored in the cache, return that object instead of performing the http request
		if (this.cache.isCached("addresses", id)) {
			console.log(`addressId ${id} is cached`);
			return this.cache.cache.addresses
				.map(addresses => addresses.find(address => address.id === id));
		}
		console.log(`addressId ${id} is not cached, retrieving from db`);

		return this
			.performRequest(this.http.get<AddressApiResponse>(this.baseUrl,
				{params: new HttpParams().set("id", "" + id)})
			)
			.map(json => Address.create().setProperties(json.addresses[0]))
			.do((address: Address) => this.cache.addOrModify(address));
	}

	/**
	 * Requested alle Addressen die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<Address[]> {
		return this
			.performRequest(this.http.get<AddressApiResponse>(this.baseUrl,
				{params: new HttpParams().set("searchTerm", "" + searchTerm)})
			)
			.map((json) => json.addresses.map(json => Address.create().setProperties(json)))
			.do((addresses: Address[]) => this.cache.addMultiple(...addresses));
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
	remove(id: number): Observable<Response> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		}))
			.do((response: Response) => this.cache.remove("addresses", id));
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
			.flatMap(json => this.getById(json.id))
			.do(address => this.addressModificationDone.emit(address));
	}
}
