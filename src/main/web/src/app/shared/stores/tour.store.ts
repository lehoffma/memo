import {AbstractStore} from "./store";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Tour} from "../model/tour";
import {ClubRole} from "../model/club-role";

@Injectable()
export class TourStore extends AbstractStore<Tour>{
    protected jsonToObject(json: any): Tour {
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

        return new Tour(
            +json["id"],
            json["title"],
            new Date(json["date"]),
            json["description"],
            role,
            json["picPath"],
            +json["capacity"],
            +json["priceMember"],
            //todo address as json
            json["meetingPoint"],
            json["vehicle"],
            +json["miles"],
            json["destination"],
            json["emptySeats"],
            json["participants"].map(id => +id)
        )
    }
    constructor(private _http: Http){
        super(_http);
        // this.baseUrl = "www.meilenwoelfe.de/shop";
        this.baseUrl = "/resources/mock-data";
        this.apiURL = "tours";
        this.loadDataUrl = `${this.baseUrl}/${this.apiURL}.json`;
        this.load();
    }
}