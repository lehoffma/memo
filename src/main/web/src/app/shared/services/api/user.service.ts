import {Injectable} from "@angular/core";
import {createUser, User} from "../../model/user";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {catchError, map, mergeMap, tap} from "rxjs/operators";
import {setProperties} from "../../model/util/base-object";
import {RowAction} from "../../utility/material-table/util/row-action";
import {ParticipantUser} from "../../../shop/shared/model/participant";
import {RowActionType} from "../../utility/material-table/util/row-action-type";
import {MemberListRowAction} from "../../../club-management/administration/member-list/member-list-row-actions";

export const userRowActions: RowAction<ParticipantUser>[] =[
	{
		icon: "edit",
		name: RowActionType.EDIT
	},
	{
		icon: "delete",
		name: RowActionType.DELETE
	},
	{
		icon: "person",
		name: MemberListRowAction.showProfile,
		route: participant => "/club/members/" + participant.user.id
	},
	{
		icon: "email",
		name: "Kontaktieren",
		children: [
			{
				icon: "phone",
				name: MemberListRowAction.phone,
				predicate: participant => !!participant.user.telephone,
				link: participant => "tel:" + participant.user.telephone,
			},
			{
				icon: "smartphone",
				name: MemberListRowAction.call,
				predicate: participant => !!participant.user.mobile,
				link: participant => "tel:" + participant.user.mobile
			},
			{
				icon: "email",
				name: MemberListRowAction.email,
				link: participant => "mailto:" + participant.user.email
			},
		]
	},
];

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
