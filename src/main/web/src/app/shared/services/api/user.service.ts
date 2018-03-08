import {Injectable} from "@angular/core";
import {User} from "../../model/user";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {catchError, map, mergeMap, share, tap} from "rxjs/operators";
import {of} from "rxjs/observable/of";

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
			.pipe(
				map(json => User.create().setProperties(json.users[0])),
				share()
			);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param {number} participantId
	 * @returns {Observable<User>}
	 */
	getByParticipantId(participantId: number): Observable<User> {
		const params = new HttpParams().set("participantId", "" + participantId);
		const request = this.performRequest(this.http.get<UserApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(json => User.create().setProperties(json.users[0])),
				share()
			);

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
			.pipe(
				map(json => json.users.map(jsonUser => User.create().setProperties(jsonUser)))
			);

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
			.pipe(
				map(value => false),
				catchError(error => of(true))
			)
	}

	/**
	 * Sendet ein User Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param user
	 * @returns {Observable<T>}
	 */
	add(user: User): Observable<User> {
		return this.addOrModify(this.http.post.bind(this.http), user);
	}

	/**
	 *
	 * @param user
	 * @returns {Observable<User>}
	 */
	modify(user: User): Observable<User> {
		return this.addOrModify(this.http.put.bind(this.http), user);
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
			.pipe(
				tap(() => this._cache.invalidateById(userId))
			);
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param user
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: AddOrModifyRequest,
						user: User): Observable<User> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {user}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(() => this._cache.invalidateById(user.id)),
				mergeMap(response => this.getById(response.id))
			)
	}

}
