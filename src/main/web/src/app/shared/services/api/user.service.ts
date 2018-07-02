import {Injectable} from "@angular/core";
import {createUser, User} from "../../model/user";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {setProperties} from "../../model/util/base-object";


@Injectable()
export class UserService extends ServletService<User> {
	constructor(protected http: HttpClient) {
		super(http, "/api/user");
	}


	jsonToObject(json: any): User {
		return setProperties(createUser(), json);
	}


	/**
	 *
	 * @param {number} participantId
	 * @returns {Observable<User>}
	 */
	getByParticipantId(participantId: number): Observable<User> {
		const params = new HttpParams().set("participantId", "" + participantId);
		const request = this.getIdRequest(params);

		return this._cache.getById(params, request);
	}

	/**
	 * Checkt ob die gegebene Email adresse von einem User verwendet wird oder nicht
	 * @param {string} email
	 * @returns {Observable<boolean>}
	 */
	isUserEmailAlreadyInUse(email: string): Observable<boolean> {
		return this.http.head(this.baseUrl, {
			params: new HttpParams().set("email", email),
			observe: "response",
			responseType: "text"
		})
			.pipe(
				map(value => false),
				catchError(error => of(true))
			)
	}

	/**
	 * Löscht den User mit der gegebenen ID aus der Datenbank
	 * @param userId
	 * @returns {Observable<T>}
	 */
	remove(userId: number): Observable<Object> {
		return this.performRequest(this.http.delete<{ id: number }>(this.baseUrl, {
			params: new HttpParams().set("id", "" + userId)
		}))
			.pipe(
				tap(() => this._cache.invalidateById(userId))
			);
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param user
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				user: User): Observable<User> {


		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {user}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(() => this.invalidateValue(user.id)),
				mergeMap(response => this.getById(response.id))
			)
	}

}
