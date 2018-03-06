import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {catchError, mergeMap, tap} from "rxjs/operators";
import {JwtHelperService} from "@auth0/angular-jwt";
import {_throw} from "rxjs/observable/throw";
import {of} from "rxjs/observable/of"
import {empty} from "rxjs/observable/empty";

@Injectable()
export class AuthService {
	private readonly AUTH_TOKEN_KEY = "auth_token";
	private readonly REFRESH_TOKEN_KEY = "refresh_token";
	private readonly REFRESH_DELAY = 600000;

	constructor(private http: HttpClient,
				private jwtHelperService: JwtHelperService) {

	}

	public getToken(): string {
		return localStorage.getItem(this.AUTH_TOKEN_KEY);
	}

	public setAccessToken(token: string): void {
		if (!token) {
			localStorage.removeItem(this.AUTH_TOKEN_KEY);
		}
		else {
			localStorage.setItem(this.AUTH_TOKEN_KEY, token);
		}
	}

	public getRefreshToken() {
		return localStorage.getItem(this.REFRESH_TOKEN_KEY);
	}

	public setRefreshToken(token: string) {
		if (!token) {
			localStorage.removeItem(this.REFRESH_TOKEN_KEY);
		}
		else {
			localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
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
			return of({auth_token: null});
		}

		return this.http.get<{ auth_token: string }>("/api/refreshAccessToken", {
			params: new HttpParams().set("refreshToken", this.getRefreshToken())
		})
			.pipe(
				tap(response => this.setAccessToken(response.auth_token)),
				catchError(error => {
					this.setAccessToken("");
					return empty<{ auth_token: string }>();
				})
			);
	}

	/**
	 *
	 * @returns {Observable<{refresh_token: string}>}
	 */
	refreshRefreshToken(): Observable<{ refresh_token: string }> {
		if (!this.getRefreshToken()) {
			return of({refresh_token: null});
		}

		return this.http.get<{ refresh_token: string }>("/api/refreshRefreshToken", {
			params: new HttpParams().set("refreshToken", this.getRefreshToken())
		})
			.pipe(
				tap(response => this.setRefreshToken(response.refresh_token)),
				catchError(error => {
					this.setRefreshToken("");
					return empty<{ refresh_token: string }>();
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
						return _throw(new Error());
					}),
					//refresh-token expired
					catchError(() => {
						return of({auth_token: null});
					})
				)
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
