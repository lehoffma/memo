import {ClubRole, rolePermissions} from "./club-role";
import {Permission, UserPermissions, visitorPermissions} from "./permission";
import {BaseObject} from "./util/base-object";
import {Gender} from "./gender";
import {Event} from "../../shop/shared/model/event";


export interface User extends BaseObject {
	readonly firstName: string;
	readonly surname: string;
	readonly gender: Gender;
	readonly birthday: Date;
	readonly telephone: string;
	readonly mobile: string;
	readonly clubRole: ClubRole;
	readonly joinDate: Date;
	readonly addresses: number[];
	readonly authoredItems: Event[];
	readonly reportResponsibilities: number[];
	readonly bankAccounts: number[];
	readonly permissions: UserPermissions;
	readonly miles: number;
	readonly email: string;
	readonly password: string;
	readonly isWoelfeClubMember: boolean;
	readonly hasSeasonTicket: boolean;
	readonly isStudent: boolean;
	readonly hasDebitAuth: boolean;
	readonly images: string[];
}

export function createUser(): User {
	return {
		id: -1,
		firstName: "",
		surname: "",
		gender: Gender.OTHER,
		birthday: null,
		telephone: "",
		mobile: "",
		clubRole: null,
		joinDate: new Date(),
		addresses: [],
		authoredItems: [],
		reportResponsibilities: [],
		bankAccounts: [],
		permissions: null,
		miles: 0,
		email: "",
		password: "",
		isWoelfeClubMember: false,
		hasSeasonTicket: false,
		isStudent: false,
		hasDebitAuth: false,
		images: ["resources/images/Logo.png"]
	}
}

export function userPermissions(user: User): UserPermissions {
	let userPermissions = user.permissions || visitorPermissions;
	let clubRolePermissions = rolePermissions[user.clubRole];
	//combine both permission states
	return Object.keys(visitorPermissions).reduce((permissions, key) => {
		permissions[key] = Math.max(permissions[key],
			userPermissions[key] || Permission.none,
			clubRolePermissions[key] || Permission.none
		);
		return permissions;
	}, {...visitorPermissions});
}
