import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {User} from "../model/user";
import {CacheStore} from "../stores/cache.store";
import {ServletService} from "./servlet.service";

@Injectable()
export class UserService extends ServletService<User> {

	constructor(private http: Http,
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
			return this.cache.cache.users
				.map(users => users.find(user => user.id === userId));
		}

		return this.performRequest(this.http.get(`/api/user?id=${userId}`))
			.map(response => response.json().users)
			.map(json => User.create().setProperties(json[0]))
			.do((user: User) => this.cache.addOrModify(user));
	}

	/**
	 * Requested alle Users die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<User[]> {
		let url = `/api/user?searchTerm=${searchTerm}`;

		return this.performRequest(this.http.get(url))
			.map(response => response.json().users)
			.map((jsonArray: any[]) => jsonArray.map(json => User.create().setProperties(json)))
			.do((users: User[]) => this.cache.addMultiple(...users));
	}

	/**
	 * Checkt ob die gegebene Email adresse von einem User verwendet wird oder nicht
	 * @param {string} email
	 * @returns {Observable<boolean>}
	 */
	isUserEmailAlreadyInUse(email: string): Observable<boolean> {
		let params: URLSearchParams = new URLSearchParams();
		params.set("email", email);
		return this.performRequest(this.http.get("/api/user", {search: params}))
			.map(response => response.json());
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param user
	 * @param profilePicture todo type
	 * @param paymentInfo todo type
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						user: User, profilePicture?: any, paymentInfo?: any): Observable<User> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.performRequest(requestMethod("/api/user", {user, profilePicture, paymentInfo}, requestOptions))
			.map(response => response.json().id as number)
			.flatMap(id => this.getById(id))
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
	remove(userId: number): Observable<Response> {
		return this.performRequest(this.http.delete("/api/user", {body: {id: userId}}))
			.do((response: Response) => this.cache.remove("users", response.json()));
	}

}
