import {Injectable} from "@angular/core";
import {User} from "../model/user";
import {Http} from "@angular/http";
import {AbstractStore} from "./store";
import {ClubRole} from "../model/club-role";
import {UserPermissions, VisitorPermissions, Permission} from "../model/permission";

@Injectable()
export class UserStore extends AbstractStore<User> {
    private convertStringToPermission(string: string) {
        switch (string) {
            case "read":
                return Permission.read;
            case "write":
                return Permission.write;
            case "none":
                return Permission.none;
            case "owner":
                return Permission.owner;
        }
        return Permission.none;
    }

    protected jsonToObject(json: any): User {
        let role: ClubRole = ClubRole.None;
        let jsonPermissions = json["permissions"];
        let permissions: UserPermissions = {
            funds: this.convertStringToPermission(jsonPermissions["funds"]),
            party: this.convertStringToPermission(jsonPermissions["party"]),
            userManagement: this.convertStringToPermission(jsonPermissions["userManagement"]),
            merch: this.convertStringToPermission(jsonPermissions["merch"]),
            tour: this.convertStringToPermission(jsonPermissions["tour"]),
        };

        switch (json["clubRole"]) {
            case "Admin":
                role = ClubRole.Admin;
                break;
            case "Kasse":
                role = ClubRole.Kasse;
                break;
            case "Mitglied":
                role = ClubRole.Mitglied;
                break;
            case "Vorstand":
                role = ClubRole.Vorstand;
                break;
            case "Organizer":
                role = ClubRole.Organizer;
        }


        return new User(
            +json["id"],
            json["firstName"],
            json["surname"],
            new Date(json["birthDate"]),
            json["telephone"],
            role,
            permissions,
            +json["miles"],
            json["email"],
            json["passwordHash"],
            json["isStudent"] === "true",
            json["hasDepitAuth"] === "true",
            json["imagePath"]
        )
    }

    constructor(private _http: Http) {
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "users";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}
