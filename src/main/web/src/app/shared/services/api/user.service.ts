import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {User} from "../../model/user";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

interface UserApiResponse {
	users: User[];
}

@Injectable()
export class UserService extends ServletService<User> {
	baseUrl = "/api/user";

	constructor(private http: HttpClient) {
		super();
	}

	/**
	 * Requested den User vom Server, welcher die gegebene ID besitzt
	 * @param userId
	 * @param options
	 * @returns {Observable<T>}
	 */
	getById(userId: number, options?: any): Observable<User> {
		const params = new HttpParams().set("id", "" + userId);
		const request = this.performRequest(this.http.get<UserApiResponse>(this.baseUrl, {params}))
			.map(json => User.create().setProperties(json.users[0]))
			.share();

		return this._cache.getById(params, request);
	}

	/**
	 * Requested alle Users die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<User[]> {
		const params = new HttpParams().set("searchTerm", searchTerm);
		const request = this.performRequest(this.http.get<UserApiResponse>(this.baseUrl, {params}))
			.map(json => json.users.map(jsonUser => User.create().setProperties(jsonUser)));

		return this._cache.search(params, request);
	}

	/**
	 * Checkt ob die gegebene Email adresse von einem User verwendet wird oder nicht
	 * @param {string} email
	 * @returns {Observable<boolean>}
	 */
	isUserEmailAlreadyInUse(email: string): Observable<boolean> {
		return this.http.head(this.baseUrl, {
			params: new HttpParams().set("email", email),
			observe: "response",
			responseType: "text"
		})
			.map(value => false)
			.catch(error => Observable.of(true))
	}

	/**
	 * Sendet ein User Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param user
	 * @param profilePicture todo type
	 * @param paymentInfo todo type
	 * @returns {Observable<T>}
	 */
	add(user: User, profilePicture?: any, paymentInfo?: any): Observable<User> {
		return this.addOrModify(this.http.post.bind(this.http), user, profilePicture, paymentInfo);
	}

	/**
	 *
	 * @param user
	 * @param profilePicture todo type
	 * @param paymentInfo todo type
	 * @returns {Observable<User>}
	 */
	modify(user: User, profilePicture?: any, paymentInfo?: any): Observable<User> {
		return this.addOrModify(this.http.put.bind(this.http), user, profilePicture, paymentInfo);
	}

	/**
	 * Löscht den User mit der gegebenen ID aus der Datenbank
	 * @param userId
	 * @returns {Observable<T>}
	 */
	remove(userId: number): Observable<Object> {
		return this.performRequest(this.http.delete<{ id: number }>(this.baseUrl, {
			params: new HttpParams().set("id", "" + userId)
		}))
			.do(() => this._cache.invalidateById(userId))
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param user
	 * @param profilePicture todo type
	 * @param paymentInfo todo type
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: AddOrModifyRequest,
						user: User, profilePicture?: any, paymentInfo?: any): Observable<User> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {
			user,
			profilePicture,
			paymentInfo
		}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.do(() => this._cache.invalidateById(user.id))
			.flatMap(response => this.getById(response.id))
	}

}
