import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {User} from "../model/user";
import {CacheStore} from "../stores/cache.store";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

interface UserApiResponse {
	users: User[];
}

@Injectable()
export class UserService extends ServletService<User> {
	baseUrl = "/api/user";

	constructor(private http: HttpClient,
				private cache: CacheStore) {
		super();
	}

	/**
	 * Requested den User vom Server, welcher die gegebene ID besitzt
	 * @param userId
	 * @param options
	 * @returns {Observable<T>}
	 */
	getById(userId: number, options?: any): Observable<User> {
		//if the user is stored in the cache, return that object instead of performing the http request
		if (this.cache.isCached("users", userId)) {
			console.log(`userId ${userId} is cached`);
			return this.cache.cache.users
				.map(users => users.find(user => user.id === userId));
		}
		console.log(`userId ${userId} is not cached: fetching from DB`);

		return this.performRequest(this.http.get<UserApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + userId)
		}))
			.map(json => User.create().setProperties(json.users[0]))
			.do((user: User) => this.cache.addOrModify(user));
	}

	/**
	 * Requested alle Users die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<User[]> {
		return this.performRequest(this.http.get<UserApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm)
		}))
			.map(json => json.users.map(jsonUser => User.create().setProperties(jsonUser)))
			.do((users: User[]) => this.cache.addMultiple(...users));
	}

	/**
	 * Checkt ob die gegebene Email adresse von einem User verwendet wird oder nicht
	 * @param {string} email
	 * @returns {Observable<boolean>}
	 */
	isUserEmailAlreadyInUse(email: string): Observable<boolean> {
		return this.http.head(this.baseUrl, {
			params: new HttpParams().set("email", email)
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
			.do(response => this.cache.remove("users", response.id));
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
			.flatMap(response => this.getById(response.id))
	}

}
