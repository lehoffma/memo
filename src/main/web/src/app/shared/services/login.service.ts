import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";

@Injectable()
export class LogInService {
	private accountSubject: BehaviorSubject<number> = new BehaviorSubject(null);
	public accountObservable: Observable<number> = this.accountSubject.asObservable();

	private readonly loginUrl = ""; //TODO

	constructor(private http: Http) {
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
		//todo remove
		if (!password.includes("gzae")) {
			return Observable.of(false).delay(2000).publish().refCount();
		}
		else if (password.includes("gzae")) {
			this.pushNewData(0);
			return Observable.of(true).delay(2000).publish().refCount();
		}

		return this.http.post(this.loginUrl, {email, password})
			.map(response => response.json())
			.map(json => {
				let {id, auth_token} = json;
				if (id !== null && id >= 0) {
					localStorage.setItem("id_token", auth_token);
					//todo store profile data in localStorage?
					this.pushNewData(id)
				}
				return id !== null;
			})
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @returns {boolean}
	 */
	logout() {
		localStorage.removeItem("id_token");
		//todo remove profile data from localStorage?

		this.pushNewData(null);
	}

	isLoggedIn() {
		return this.accountSubject.getValue() !== null;
	}

	isLoggedInObservable() {
		return this.accountObservable.map(id => id !== null);
	}

	pushNewData(id: number) {
		this.accountSubject.next(id);
	}
}
