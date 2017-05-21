import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {User} from "../model/user";
import {ServletService} from "../model/servlet-service";
import {CacheStore} from "../stores/cache.store";

@Injectable()
export class UserService implements ServletService<User> {

	constructor(private http: Http,
				private cache: CacheStore) {

	}

	handleError(error: Error): Observable<any> {
		console.error(error);
		return Observable.empty();
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

		//todo remove when server is running todo demo
		if (userId !== -1) {
			return this.search("")
				.map(users => users.find(user => user.id === userId));
		}

		return this.http.get(`/api/user?id=${userId}`)
			.map(response => response.json())
			.map(json => User.create().setProperties(json))
			.do((user: User) => this.cache.addOrModify(user))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 * Requested alle Users die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: any): Observable<User[]> {
		let url = `/api/user?searchTerm=${searchTerm}`;
		//todo remove when server is running todo demo
		url = `/resources/mock-data/users.json`;

		return this.http.get(url)
			.map(response => response.json())
			.map((jsonArray: any[]) => jsonArray.map(json => User.create().setProperties(json)))
			.do((users: User[]) => this.cache.addMultiple(...users))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 * Sendet ein User Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param user
	 * @param options
	 * @returns {Observable<T>}
	 */
	addOrModify(user: User, options: any = {profilePicture: null, paymentInfo: null}): Observable<User> {
		const {profilePicture, paymentInfo} = options;
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.post(`/api/user`, {user, profilePicture, paymentInfo}, requestOptions)
			.map(response => response.json())
			.flatMap(userId => this.getById(userId))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 * Löscht den User mit der gegebenen ID aus der Datenbank
	 * @param userId
	 * @param options
	 * @returns {Observable<T>}
	 */
	remove(userId: number, options?: any): Observable<Response> {
		return this.http.delete("/api/user", {body: {id: userId}})
			.do((response: Response) => this.cache.remove("users", response.json()))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

}
