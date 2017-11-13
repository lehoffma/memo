import {Injectable} from "@angular/core";
import {UserService} from "./user.service";
import {User} from "../../model/user";
import {isNullOrUndefined} from "util";
import {MatSnackBar} from "@angular/material";
import {ActionPermissions} from "../../expandable-table/expandable-table.component";
import {Permission, UserPermissions} from "../../model/permission";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../authentication/auth.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, catchError, share, retry} from "rxjs/operators";
import {of} from "rxjs/observable/of";

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

	private _currentUser$ = new BehaviorSubject(null);
	public currentUser$: Observable<User> = this._currentUser$.asObservable();
	private readonly loginUrl = "/api/login";
	private readonly logoutUrl = "/api/logout";

	private readonly profileKey = "profileId";

	constructor(private http: HttpClient,
				private authService: AuthService,
				private snackBar: MatSnackBar,
				private userService: UserService) {
		const currentUserId = JSON.parse(localStorage.getItem(this.profileKey));
		if (currentUserId && !isNullOrUndefined(currentUserId) && this.authService.isAuthenticated()) {
			this.pushNewData(+currentUserId);
		}
		this.accountObservable
			.pipe(
				mergeMap(id => id !== null ? this.userService.getById(id) : of(null))
			)
			.subscribe(user => this._currentUser$.next(user));
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
			.pipe(
				map(json => {
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
				}),
				catchError(error => {
					console.error(error);
					//todo better error handling
					return of(false);
				}),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	logout(): Observable<boolean> {
		return this.http.post(this.logoutUrl, {auth_token: this.authService.getToken()}, {
			responseType: "text"
		})
			.pipe(
				map(() => {
					this.authService.setAccessToken(null);
					this.authService.setRefreshToken("");
					localStorage.removeItem(this.profileKey);
					this.pushNewData(null);
					this.snackBar.open("Du wurdest ausgeloggt.", "Schließen", {
						duration: 2000
					});
					return true;
				}),
				retry(3),
				catchError(error => {
					console.error(error);
					//todo better error handling
					return of(false);
				}),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}

	/**
	 *
	 * @param permissionsKeys
	 * @returns {Observable<ActionPermissions>}
	 */
	getActionPermissions(...permissionsKeys: (keyof UserPermissions)[]): Observable<ActionPermissions> {
		return this.currentUser$
			.pipe(
				map(user => user === null
					? {
						"Hinzufuegen": false,
						"Bearbeiten": false,
						"Loeschen": false,
					}
					: {
						"Hinzufuegen": permissionsKeys.some(permissionsKey =>
							user.userPermissions[permissionsKey] >= Permission.create),
						"Bearbeiten": permissionsKeys.some(permissionsKey =>
							user.userPermissions[permissionsKey] >= Permission.write),
						"Loeschen": permissionsKeys.some(permissionsKey =>
							user.userPermissions[permissionsKey] >= Permission.delete)
					})
			);
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
	 * @returns {Observable<R>}
	 */
	isLoggedInObservable() {
		return this.accountObservable
			.pipe(map(id => id !== null));
	}

	/**
	 *
	 * @param id
	 */
	pushNewData(id: number) {
		this.accountSubject.next(id);
	}
}
