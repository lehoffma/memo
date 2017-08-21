import {ClubRole, rolePermissions} from "./club-role";
import {UserPermissions} from "./permission";
import {BaseObject} from "./util/base-object";
import {Gender} from "./gender";

/*
adresses			:[]
bankAccounts		:[]
birthday			:"Jul 31, 2017"
clubRole			:null
email				:"lennarthoffmann@gmx.de"
firstName			:"aa"
gender				:"Männlich"
hasDebitAuth		:false
hasSeasonTicket		:false
id					:1
imagePath			:"resources/images/Logo.png"
isStudent			:true
isWoelfeClubMember	:false
joinDate			:"Aug 21, 2017"
miles				:0
mobile				:null
passwordHash		:"gzae"
permissions			:{id: 1, funds: "5", party: "5", user: "5", merch: "5", tour: "5", stock: "5", settings: "5"}
surname				:"aa"
telephone			:""
 */


export class User extends BaseObject<User> {
	/**
	 *
	 * @param id Die ID des Users (nur zwischen Usern einzigartig)
	 * @param firstName Vorname des Users, z.B. "Le"
	 * @param surname Nachname des Users, z.B. "Hoffmann"
	 * @param gender Das Geschlecht des Users, z.B. Gender.MALE
	 * @param birthday Geburtstag des Users, z.B. "20.04.1889"
	 * @param telephone Handy oder Festnetznummer mit oder ohne Trennzeichen zwischen Vorwahl und Rest, z.B. "0151/18656036"
	 * @param clubRole Die Rolle des Users innerhalb des Vereins, z.B. Vorstand
	 * @param joinDate das Eintrittsdatum des Users
	 * @param addresses Die ID der Adresse des Nutzers
	 * @param permissions Auf was der User zugreifen darf (kosten, schreibrechte für events etc)
	 * @param miles Die vom User bisher gefahreren Meilen
	 * @param email die Email des Users, z.B. "gzae@gmx.net"
	 * @param passwordHash /
	 * @param isWoelfeClubMember ob der User Woelfemitglied ist
	 * @param hasSeasonTicket ob der User eine Dauerkarte besitzt
	 * @param isStudent ob der User ein Student is (Studenten bekommen einen Discount)
	 * @param hasDebitAuth ob der User Lastschrift Verfahren als Bezahlmethode ausgewählt hat
	 * @param imagePath der Pfad des Profilbild
	 */
	constructor(public readonly id: number,
				public readonly firstName: string,
				public readonly surname: string,
				public readonly gender: Gender,
				public readonly birthday: Date,
				public readonly telephone: string,
				public readonly clubRole: ClubRole,
				public readonly joinDate: Date,
				public readonly addresses: number[],
				public readonly permissions: UserPermissions,
				public readonly miles: number,
				public readonly email: string,
				public readonly passwordHash: string,
				public readonly isWoelfeClubMember: boolean,
				public readonly hasSeasonTicket: boolean,
				public readonly isStudent: boolean,
				public readonly hasDebitAuth: boolean,
				public readonly imagePath: string) {
		super(id);
	}

	static create() {
		return new User(-1, "", "", Gender.OTHER, null, "", ClubRole.None, new Date(), [],
			null, 0, "", "", false, false, false, false, "resources/images/Logo.png");
	}

	static isUser(user: any): user is User {
		return user && (<User>user).email !== undefined;
	}

	get userPermissions() {
		if (this.permissions) {
			return this.permissions;
		}
		return rolePermissions[this.clubRole];
	}
}
