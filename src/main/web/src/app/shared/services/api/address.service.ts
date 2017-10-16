import {EventEmitter, Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Address} from "../../model/address";

interface AddressApiResponse {
	addresses: Partial<Address>[]
}

@Injectable()
export class AddressService extends ServletService<Address> {
	baseUrl = "/api/address";
	addressModificationDone: EventEmitter<Address> = new EventEmitter();
	redirectUrl: string;

	constructor(private http: HttpClient) {
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
			.map(json => Address.create().setProperties(json.addresses[0]));

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
			.map((json) => json.addresses.map(json => Address.create().setProperties(json)));

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
	remove(id: number): Observable<Response> {
		//todo invalidate stuff
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		}))
			.do(() => this._cache.invalidateById(id));
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

		//todo invalidate stuff
		return this.performRequest(requestMethod<AddOrModifyResponse>("/api/address", {address}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.do(() => this._cache.invalidateById(address.id))
			.flatMap(json => this.getById(json.id))
			.do(address => this.addressModificationDone.emit(address));
	}
}
