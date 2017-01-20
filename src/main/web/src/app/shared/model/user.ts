import {ClubRole} from "./club-role";
import {UserPermissions, VisitorPermissions} from "./permission";


export class User {

    constructor(private _id: number = 9999,
                private _firstName: string = "default",
                private _surname: string = "default",
                private _birthDate: Date = new Date(1999, 9, 19),
                private _telephone: string = "default",
                private _clubRole: ClubRole = ClubRole.Mitglied,
                private _permissions: UserPermissions = VisitorPermissions,
                private _miles: number = 9999,
                private _email: string = "default",
                private _passwordHash: string = "default",
                private _isStudent: boolean = false,
                private _hasDebitAuth: boolean = false,
                private _imagePath: string = "default") {
    }


    get id(): number {
        return this._id;
    }

    get firstName(): string {
        return this._firstName;
    }

    get surname(): string {
        return this._surname;
    }

    get birthDate(): Date {
        return this._birthDate;
    }

    get telephone(): string {
        return this._telephone;
    }

    get clubRole(): ClubRole {
        return this._clubRole;
    }

    get permissions(): UserPermissions {
        return this._permissions;
    }

    get miles(): number {
        return this._miles;
    }

    get email(): string {
        return this._email;
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    get isStudent(): boolean {
        return this._isStudent;
    }

    get hasDebitAuth(): boolean {
        return this._hasDebitAuth;
    }

    get imagePath(): string {
        return this._imagePath;
    }


    set id(value: number) {
        this._id = value;
    }

    set firstName(value: string) {
        this._firstName = value;
    }

    set surname(value: string) {
        this._surname = value;
    }

    set birthDate(value: Date) {
        this._birthDate = value;
    }

    set telephone(value: string) {
        this._telephone = value;
    }

    set clubRole(value: ClubRole) {
        this._clubRole = value;
    }

    set permissions(permissions: UserPermissions) {
        //clone object
        this._permissions = Object.assign({}, permissions);
    }

    set miles(value: number) {
        this._miles = value;
    }

    set email(value: string) {
        this._email = value;
    }

    set passwordHash(value: string) {
        this._passwordHash = value;
    }

    set isStudent(value: boolean) {
        this._isStudent = value;
    }

    set hasDebitAuth(value: boolean) {
        this._hasDebitAuth = value;
    }

    set imagePath(value: string) {
        this._imagePath = value;
    }
}