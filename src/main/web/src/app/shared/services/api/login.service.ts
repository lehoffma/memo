import {Injectable} from "@angular/core";
import {UserService} from "./user.service";
import {User, userPermissions} from "../../model/user";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActionPermissions} from "../../utility/material-table/util/action-permissions";
import {Permission, UserPermissions} from "../../model/permission";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AuthService} from "../../authentication/auth.service";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {catchError, distinctUntilChanged, filter, map, mergeMap, retry, share} from "rxjs/operators";
import {EventService} from "./event.service";
import {SNACKBAR_PRESETS} from "../../../util/util";

interface LoginApiResponse {
	id: number;
	auth_token: string;
	refresh_token: string;
}

@Injectable()
export class LogInService {
	public redirectUrl = "/";
	public initialized$ = new BehaviorSubject(false);
	private accountSubject: BehaviorSubject<number> = new BehaviorSubject(null);
	public accountObservable: Observable<number> =
		combineLatest(this.accountSubject, this.initialized$)
			.pipe(
				filter(([id, initialized]) => initialized),
				map(([id, _]) => id)
			);
	public currentUser$: Observable<User> = this.accountObservable
		.pipe(
			distinctUntilChanged(),
			mergeMap(id => id !== null ? this.userService.valueChanges(id) : of(null)),
		);

	private _currentUser$: BehaviorSubject<User> = new BehaviorSubject<User>(null);

	private readonly loginUrl = "/api/login";
	private readonly logoutUrl = "/api/logout";

	private readonly profileKey = "profileId";

	constructor(private http: HttpClient,
				private authService: AuthService,
				private eventService: EventService,
				private snackBar: MatSnackBar,
				private userService: UserService) {
		this.loginFromToken();
		this.currentUser$.subscribe(it => this._currentUser$.next(it));
	}

	currentUser(){
		return this._currentUser$.getValue();
	}

	/**
	 *
	 */
	loginFromToken() {
		let request = this.authService.getRefreshedAccessToken();

		request
			.pipe(
				filter(({auth_token}) => {
					if (auth_token !== null) {
						return true;
					}
					this.initialized$.next(true);
					return false;
				}),
				mergeMap(({auth_token}) =>
					this.http.get<{ user: number }>(this.loginUrl, {
						params: new HttpParams().set("auth_token", auth_token)
					})),
				catchError((err, caught) => {
					console.error(err);
					this.authService.setAccessToken("");
					this.authService.setRefreshToken("");
					return of(null);
				}),
				share()
			)
			.subscribe((response) => {
				let user = null;
				if (response !== null) {
					user = response.user;
				}
				this.pushNewData(user);
				this.initialized$.next(true);
			});

		return request;
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
						this.eventService.clearCaches();

						this.pushNewData(id);
					}
					return id !== null;
				}),
				catchError(error => {
					console.error(error);
					//todo better error handling
					return of(false);
				}),
				//convert the observable to a hot observable
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
					//clear auth tokens
					this.authService.setAccessToken(null);
					this.authService.setRefreshToken("");

					//clear event caches
					this.eventService.clearCaches();

					//clear login data from this service
					this.pushNewData(null);

					//notify user
					this.snackBar.open("Du wurdest ausgeloggt.", "Schließen", {...SNACKBAR_PRESETS.info});
					return true;
				}),
				retry(3),
				catchError(error => {
					console.error(error);
					//todo better error handling
					return of(false);
				}),
				//convert the observable to a hot observable
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
				map(user => user === null ? null : userPermissions(user)),
				map(userPermissions => userPermissions === null
					? {
						"Hinzufuegen": false,
						"Bearbeiten": false,
						"Loeschen": false,
					}
					: {
						"Hinzufuegen": permissionsKeys.some(permissionsKey =>
							userPermissions[permissionsKey] >= Permission.create),
						"Bearbeiten": permissionsKeys.some(permissionsKey =>
							userPermissions[permissionsKey] >= Permission.write),
						"Loeschen": permissionsKeys.some(permissionsKey =>
							userPermissions[permissionsKey] >= Permission.delete)
					}),
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
