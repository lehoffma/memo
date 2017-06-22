import {Injectable} from "@angular/core";
import {Address} from "../model/address";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {CacheStore} from "../stores/cache.store";
import {ServletService} from "./servlet.service";

@Injectable()
export class AddressService extends ServletService<Address> {
	constructor(private http: Http,
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
			return this.cache.cache.addresses
				.map(addresses => addresses.find(address => address.id === id));
		}

		//todo remove when server is running
		if (id !== -1) {
			return this.search("")
				.map(addresses => addresses.find(address => address.id === id));
		}

		return this.performRequest(this.http.get(`/api/address?id=${id}`))
			.map(response => response.json().addresses)
			.map(json => Address.create().setProperties(json))
			.do((address: Address) => this.cache.addOrModify(address));
	}

	/**
	 * Requested alle Addressen die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<Address[]> {
		let url = `/api/addresses?searchTerm=${searchTerm}`;
		//todo remove when server is running
		url = `/resources/mock-data/addresses.json`;

		return this.performRequest(this.http.get(url))
			.map(response => response.json().addresses)
			.map((jsonArray: any[]) => jsonArray.map(json => Address.create().setProperties(json)))
			.do((addresses: Address[]) => this.cache.addMultiple(...addresses));
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param address
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						address: Address): Observable<Address> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.performRequest(requestMethod("/api/address", {address}, requestOptions))
			.map(response => response.json().id)
			.flatMap(id => this.getById(id));
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
		return this.performRequest(this.http.delete("/api/address", {body: {id: id}}))
			.do((response: Response) => this.cache.remove("addresses", id));
	}

}
