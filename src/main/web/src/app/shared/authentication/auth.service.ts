import {Injectable} from "@angular/core";
import {tokenNotExpired} from "angular2-jwt";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Rx";

@Injectable()
export class AuthService {
	private readonly AUTH_TOKEN_KEY = "auth_token";
	private readonly REFRESH_TOKEN_KEY = "refresh_token";
	private readonly REFRESH_DELAY = 600000;

	constructor(private http: HttpClient) {

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
		localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
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
		return this.http.get<{ auth_token: string }>("/api/refreshAccessToken", {
			params: new HttpParams().set("refreshToken", this.getRefreshToken())
		})
			.do(response => this.setAccessToken(response.auth_token));
	}

	/**
	 *
	 * @returns {Observable<{refresh_token: string}>}
	 */
	refreshRefreshToken(): Observable<{ refresh_token: string }> {
		return this.http.get<{ refresh_token: string }>("/api/refreshRefreshToken", {
			params: new HttpParams().set("refreshToken", this.getRefreshToken())
		})
			.do(response => this.setRefreshToken(response.refresh_token));
	}

	/**
	 *
	 * @returns {boolean}
	 */
	public isAuthenticated(): boolean {
		const token = this.getToken();
		return tokenNotExpired(null, token)
	}
}
