import {Injectable} from "@angular/core";
import {ServletService} from "../model/servlet-service";
import {Address} from "../model/address";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {CacheStore} from "../stores/cache.store";

@Injectable()
export class AddressService implements ServletService<Address> {
	constructor(private http: Http,
				private cache: CacheStore,) {
	}

	handleError(error: Error): Observable<any> {
		console.error(error);
		return Observable.empty();
	}

	/**
	 * Requested die Addresse vom Server, welche die gegebene ID besitzt
	 * @param id
	 * @param options
	 * @returns {any}
	 */
	getById(id: number, options?: any): Observable<Address> {
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

		return this.http.get(`/api/address?id=${id}`)
			.map(response => response.json().addresses)
			.map(json => Address.create().setProperties(json))
			.do((address: Address) => this.cache.addOrModify(address))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
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

		return this.http.get(url)
			.map(response => response.json().addresses)
			.map((jsonArray: any[]) => jsonArray.map(json => Address.create().setProperties(json)))
			.do((addresses: Address[]) => this.cache.addMultiple(...addresses))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param address
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						address: Address, options?: any): Observable<Address> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		//todo wie genau werden addressen angelegt?

		return requestMethod("/api/address", {address}, requestOptions)
			.map(response => response.json().id)
			.map(id => this.getById(id))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 * @param address
	 * @param options
	 * @returns {Observable<T>}
	 */
	add(address: Address, options?: any): Observable<Address> {
		return this.addOrModify(this.http.post.bind(this.http), address, options);
	}

	/**
	 *
	 * @param address
	 * @param options
	 * @returns {Observable<Address>}
	 */
	modify(address: Address, options?: any): Observable<Address> {
		return this.addOrModify(this.http.put.bind(this.http), address, options);
	}

	/**
	 *
	 * @param id
	 * @param options
	 * @returns {Observable<T>}
	 */
	remove(id: number, options?: any): Observable<Response> {

		return this.http.delete("/api/address", {body: {id: id}})
			.do((response: Response) => this.cache.remove("addresses", response.json()))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

}
