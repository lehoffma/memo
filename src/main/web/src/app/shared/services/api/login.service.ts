import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {UserService} from "./user.service";
import {User} from "../../model/user";
import {isNullOrUndefined} from "util";
import {MdSnackBar} from "@angular/material";
import {ActionPermissions} from "../../expandable-table/expandable-table.component";
import {Permission, UserPermissions} from "../../model/permission";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../authentication/auth.service";

interface LoginApiResponse {
	id: number;
	auth_token: string;
	refresh_token: string;
}

@Injectable()
export class LogInService {
	public redirectUrl = "/";
	private accountSubject: BehaviorSubject<number> = new BehaviorSubject(null);
	public accountObservable: Observable<number> = this.accountSubject.asObservable();
	private readonly loginUrl = "/api/login";
	private readonly logoutUrl = "/api/logout";

	private readonly profileKey = "profileId";

	constructor(private http: HttpClient,
				private authService: AuthService,
				private snackBar: MdSnackBar,
				private userService: UserService) {
		const currentUserId = JSON.parse(localStorage.getItem(this.profileKey));
		if (currentUserId && !isNullOrUndefined(currentUserId) && this.authService.isAuthenticated()) {
			this.pushNewData(+currentUserId);
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

		return this.http.post<LoginApiResponse>(this.loginUrl, {email, password})
			.map(json => {
				const {id, auth_token, refresh_token} = json;
				if (id !== null && id >= 0) {
					this.authService.setAccessToken(auth_token);
					this.authService.setRefreshToken(refresh_token);
					//store profile data in local storage (so the user won't get logged out if he closes the tab)
					//todo use cookie instead
					localStorage.setItem(this.profileKey, "" + id);

					this.pushNewData(id);
				}
				return id !== null;
			})
			.retry(3)
			.catch(error => {
				console.error(error);
				//todo better error handling
				return Observable.of(false);
			})
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
	}

	/**
	 *
	 * @returns {boolean}
	 */
	logout(): Observable<boolean> {
		return this.http.post<{}>(this.logoutUrl, {auth_token: this.authService.getToken()})
			.map(() => {
				this.authService.setAccessToken(null);
				this.authService.setRefreshToken("");
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
				//todo better error handling
				return Observable.of(false);
			})
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
	}

	/**
	 *
	 * @param permissionsKeys
	 * @returns {Observable<ActionPermissions>}
	 */
	getActionPermissions(...permissionsKeys: (keyof UserPermissions)[]): Observable<ActionPermissions> {
		return this.currentUser()
			.map(user => user === null
				? {
					add: false,
					edit: false,
					remove: false,
				}
				: {
					add: permissionsKeys.some(permissionsKey =>
						user.userPermissions[permissionsKey] >= Permission.create),
					edit: permissionsKeys.some(permissionsKey =>
						user.userPermissions[permissionsKey] >= Permission.write),
					remove: permissionsKeys.some(permissionsKey =>
						user.userPermissions[permissionsKey] >= Permission.delete)
				});
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
