import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import {catchError, mergeMap, tap} from "rxjs/operators";
import {JwtHelperService} from "../services/jwt-helper.service";
import {StorageService} from "../services/storage.service";
import {isPlatformBrowser} from "@angular/common";

@Injectable()
export class AuthService {
	private readonly AUTH_TOKEN_KEY            = "auth_token";
	private readonly REFRESH_TOKEN_KEY         = "refresh_token";
	private readonly REMEMBER_ME_KEY           = "remember_me";
	private readonly REFRESH_DELAY             = 60 * 60 * 1000;	//every hour
	private _accessToken                       = null;
	private _refreshToken                      = null;
	private jwtHelperService: JwtHelperService = new JwtHelperService();

	constructor(private http: HttpClient,
				private storage: StorageService,
				@Inject(PLATFORM_ID) private platformId: Object) {
	}

	public _saveLogin = null;

	get saveLogin() {
		if (this._saveLogin !== null) {
			return this._saveLogin;
		}

		return this.storage.local()
			.map(storage => storage.getItem(this.REMEMBER_ME_KEY))
			.map(saveLogin => saveLogin === "true")
			.orElse(false);
	}

	set saveLogin(saveLogin: boolean) {
		this._saveLogin = saveLogin;
		this.storage.local().ifPresent(storage => storage.setItem(this.REMEMBER_ME_KEY, "" + saveLogin));
	}


	public getToken(): string {
		if (this._accessToken !== null) {
			return this._accessToken;
		}
		if (this.saveLogin) {
			return this.storage.local()
				.map(storage => storage.getItem(this.AUTH_TOKEN_KEY))
				.orElse(null);
		}
		return null;
	}

	public setAccessToken(token: string): void {
		if (!token) {
			this._accessToken = null;
			this.storage.local().ifPresent(storage => storage.removeItem(this.AUTH_TOKEN_KEY));
		}
		else {
			this._accessToken = token;
			if (this.saveLogin) {
				this.storage.local().ifPresent(storage => storage.setItem(this.AUTH_TOKEN_KEY, token));
			}
		}
	}

	public getRefreshToken() {
		if (this._refreshToken !== null) {
			return this._refreshToken;
		}
		if (this.saveLogin) {
			return this.storage.local()
				.map(storage => storage.getItem(this.REFRESH_TOKEN_KEY))
				.orElse(null);
		}
		return null;
	}

	public setRefreshToken(token: string) {
		if (!token) {
			this._refreshToken = null;
			this.storage.local().ifPresent(storage => storage.removeItem(this.REFRESH_TOKEN_KEY));
		}
		else {
			this._refreshToken = token;
			if (this.saveLogin) {
				this.storage.local().ifPresent(storage => storage.setItem(this.REFRESH_TOKEN_KEY, token));
			}
		}
	}


	/**
	 *
	 */
	initRefreshToken() {
		//attempt to refresh the token once on startup
		if (!!this.getRefreshToken() && this.getRefreshToken() !== undefined) {
			this.refreshRefreshToken()
				.subscribe(console.log, console.error);
		}


		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		//attempt to refresh after the specified interval
		setInterval(() => {
			console.log("refreshing refreshToken");
			if (!!this.getRefreshToken() && this.getRefreshToken() !== undefined) {
				this.refreshRefreshToken()
					.subscribe(console.log, console.error);
			}
		}, this.REFRESH_DELAY);

	}

	/**
	 *
	 * @returns {Observable<{auth_token: string}>}
	 */
	refreshAccessToken(): Observable<{ auth_token: string }> {
		if (!this.getRefreshToken()) {
			this.setAccessToken("");
			return of({auth_token: null});
		}

		return this.http.get<{ auth_token: string }>("/api/refreshAccessToken", {
				params: new HttpParams().set("refreshToken", this.getRefreshToken())
			})
			.pipe(
				tap(response => this.setAccessToken(response.auth_token)),
				catchError(error => {
					console.warn(error);
					this.setAccessToken("");
					return throwError(error);
				})
			);
	}

	/**
	 *
	 * @returns {Observable<{refresh_token: string}>}
	 */
	refreshRefreshToken(): Observable<{ refresh_token: string }> {
		if (!this.getRefreshToken()) {
			this.setAccessToken("");
			this.setRefreshToken("");
			return of({refresh_token: null});
		}

		return this.http.get<{ refresh_token: string }>("/api/refreshRefreshToken", {
				params: new HttpParams().set("refreshToken", this.getRefreshToken())
			})
			.pipe(
				tap(response => this.setRefreshToken(response.refresh_token)),
				catchError(error => {
					console.error(error);
					this.setAccessToken("");
					this.setRefreshToken("");
					return of({refresh_token: null});
					// return empty<{ refresh_token: string }>();
				})
			);
	}


	public getRefreshedAccessToken(): Observable<{ auth_token: string } | null> {
		if (this.isAuthenticated()) {
			return of({auth_token: this.getToken()});
		}
		else {
			//try refreshing token
			return this.refreshAccessToken()
				.pipe(
					mergeMap(() => {
						//refreshing token worked
						if (this.isAuthenticated()) {
							return of({auth_token: this.getToken()});
						}
						//refreshing token didn't work for some other reason
						return of({auth_token: null});
					}),
					//refresh-token expired
					catchError(() => {
						return of({auth_token: null});
					})
				);
		}
	}

	/**
	 *
	 * @returns {boolean}
	 */
	public isAuthenticated(): boolean {
		const token = this.getToken();

		try {
			if (token !== null) {
				return !this.jwtHelperService.isTokenExpired(token);
			}
		}
			//catch error that could occur when auth_token is not a valid jwt
		catch (e) {
		}
		return false;
	}
}
