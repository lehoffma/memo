import {Injectable} from "@angular/core";
import {User} from "../model/user";
import {Http} from "@angular/http";
import {AbstractStore} from "./store";
import {UserPermissions} from "../model/permission";

@Injectable()
export class UserStore extends AbstractStore<User> {
	protected jsonToObject(json: any): User {
		let jsonPermissions = json["permissions"];
		let permissions: UserPermissions = {
			funds: jsonPermissions["funds"],
			party: jsonPermissions["party"],
			userManagement: jsonPermissions["userManagement"],
			merch: jsonPermissions["merch"],
			tour: jsonPermissions["tour"],
			stock: jsonPermissions["stock"],
			accountManagement: jsonPermissions["accountManagement"]
		};


		return new User(
			json["id"],
			json["firstName"],
			json["surname"],
			new Date(json["birthDate"]),
			json["telephone"],
			json["expectedRole"],
			permissions,
			+json["miles"],
			json["email"],
			json["passwordHash"],
			json["isStudent"],
			json["hasDepitAuth"],
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
