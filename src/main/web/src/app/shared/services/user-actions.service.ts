import {Injectable} from "@angular/core";
import {RowAction} from "../utility/material-table/util/row-action";
import {LogInService} from "./api/login.service";
import {map} from "rxjs/operators";
import {User, userPermissions} from "../model/user";
import {RowActionType} from "../utility/material-table/util/row-action-type";
import {ClubRole, isAuthenticated} from "../model/club-role";
import {Permission} from "../model/permission";
import {MemberListRowAction} from "../../club/member-list/member-list-row-actions";
import {Observable} from "rxjs";

@Injectable({
	providedIn: "root"
})
export class UserActionsService {

	constructor(private loginService: LogInService,) {
	}

	private getDefaultUserActions<T>(getUser: (value: T) => User, canRead: boolean, canEdit: boolean, canRemove: boolean): RowAction<T>[] {
		let base: RowAction<T>[] = [];
		base.push(
			{
				icon: "edit",
				name: RowActionType.EDIT,
				predicate: value => canEdit,
				route: value => `/club/members/${getUser(value).id}/edit`,
			},
			{
				icon: "delete",
				name: RowActionType.DELETE,
				predicate: value => canRemove,
			},
		);


		if (canRead) {
			base.push(
				{
					icon: "email",
					name: "Kontaktieren",
					children: [
						{
							icon: "phone",
							name: MemberListRowAction.phone,
							predicate: value => getUser(value).telephone !== null,
							link: value => "tel:" + getUser(value).telephone,
						},
						{
							icon: "smartphone",
							name: MemberListRowAction.call,
							predicate: value => getUser(value).mobile !== null,
							link: value => "tel:" + getUser(value).mobile
						},
						{
							icon: "email",
							name: MemberListRowAction.email,
							link: value => "mailto:" + getUser(value).email
						}
					]
				}
			)
		}

		base.push(
			{
				icon: "person",
				name: MemberListRowAction.showProfile,
				route: value => "/club/members/" + getUser(value).id
			}
		);

		return base;
	}

	public getUserActions<T>(getUser: (value: T) => User,
							 withDefaults: boolean = true,
							 ...additionalActionSuppliers: ((canRead: boolean, canEdit: boolean, canRemove?: boolean) => RowAction<T>)[])
		: Observable<RowAction<T>[]> {
		return this.loginService.currentUser$.pipe(
			map((currentUser: User) => {
				const canRead = currentUser && (isAuthenticated(currentUser.clubRole, ClubRole.Vorstand) || userPermissions(currentUser).userManagement >= Permission.read);
				const canEdit = currentUser && (isAuthenticated(currentUser.clubRole, ClubRole.Vorstand) || userPermissions(currentUser).userManagement > Permission.read);
				const canRemove = currentUser && (isAuthenticated(currentUser.clubRole, ClubRole.Vorstand) || userPermissions(currentUser).userManagement >= Permission.delete);
				let base: RowAction<T>[] = [];

				if(withDefaults){
					base.push(...this.getDefaultUserActions(getUser, canRead, canEdit, canRemove));
				}

				base.push(...additionalActionSuppliers
					.map(supplier => supplier(canRead, canEdit, canRemove))
					.filter(it => it !== undefined)
				);

				return base;
			})
		);
	}
}
