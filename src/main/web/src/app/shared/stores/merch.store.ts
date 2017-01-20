import {AbstractStore} from "./store";
import {Injectable} from "@angular/core";
import {Merchandise} from "../model/merchandise";
import {Http} from "@angular/http";
import {ClubRole} from "../model/club-role";

@Injectable()
export class MerchStore extends AbstractStore<Merchandise> {
    protected jsonToObject(json: any): Merchandise {
        let role: ClubRole = ClubRole.None;

        switch (json["expectedRole"]) {
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

        return new Merchandise(
            +json["id"],
            json["title"],
            new Date(json["date"]),
            json["description"],
            role,
            json["picPath"],
            +json["capacity"],
            json["color"],
            json["material"],
            json["sizeTable"],
            +json["priceMember"],
            //todo address as json
            json["meetingPoint"]
        )
    }

    constructor(private _http: Http) {
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "merch";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}