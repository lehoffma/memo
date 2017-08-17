import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {UserService} from "./user.service";
import {User} from "../model/user";
import {isNullOrUndefined} from "util";
import {MdSnackBar} from "@angular/material";

@Injectable()
export class LogInService {
	private accountSubject: BehaviorSubject<number> = new BehaviorSubject(null);
	public accountObservable: Observable<number> = this.accountSubject.asObservable();

	public redirectUrl = "/";

	private readonly loginUrl = "/api/login";
	private readonly logoutUrl = "/api/logout";

	private readonly authTokenKey = "auth_token";
	private readonly profileKey = "profile";

	constructor(private http: Http,
				private snackBar: MdSnackBar,
				private userService: UserService) {
		const currentUser = JSON.parse(localStorage.getItem(this.profileKey));
		if (currentUser && !isNullOrUndefined(currentUser.id)) {
			this.pushNewData(+currentUser.id);
		}
	}

	/**
	 * Sendet POST-Request an den Server mit den übergebenen Login-Daten
	 * Gibt ein Promise zurück, welches die UserID enthält. Falls die Daten
	 * falsch sind, ist diese UserID === null
	 * @param email
	 * @param password
	 * @returns {Observable<boolean>} Observable welches true als ergebnis beinhaltet, wenn die nutzerdaten korrekt sind,
	 * sonst false
	 */
	login(email: string, password: string): Observable<boolean> {

		return this.http.post(this.loginUrl, {email, password})
			.map(response => response.json())
			.map(json => {
				const {id, auth_token} = json;
				if (id !== null && id >= 0) {
					localStorage.setItem(this.authTokenKey, auth_token);
					//store profile data in local storage (so the user won't get logged out if he closes the tab)
					this.userService.getById(id).first()
						.subscribe(user => localStorage.setItem(this.profileKey, JSON.stringify(user)));

					this.pushNewData(id);
				}
				return id !== null;
			})
			.retry(3)
			.catch(error => {
				console.error(error);
				return Observable.of(false);
			})
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @returns {boolean}
	 */
	logout(): Observable<boolean> {
		return this.http.post(this.logoutUrl, {auth_token: localStorage.getItem(this.authTokenKey)})
			.map(() => {
				localStorage.removeItem(this.authTokenKey);
				localStorage.removeItem(this.profileKey);
				this.pushNewData(null);
				this.snackBar.open("Du wurdest ausgeloggt.", "Schließen", {
					duration: 2000
				});
				return true;
			})
			.retry(3)
			.catch(error => {
				console.error(error);
				return Observable.of(false);
			})
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isLoggedIn() {
		return this.accountSubject.getValue() !== null;
	}

	/**
	 *
	 * @returns {Observable<User>}
	 */
	currentUser(): Observable<User> {
		const currentId = this.accountSubject.getValue();
		return currentId !== null ? this.userService.getById(this.accountSubject.getValue()) : Observable.of(null);
	}

	/**
	 *
	 * @returns {Observable<R>}
	 */
	isLoggedInObservable() {
		return this.accountObservable.map(id => id !== null);
	}

	/**
	 *
	 * @param id
	 */
	pushNewData(id: number) {
		this.accountSubject.next(id);
	}
}
