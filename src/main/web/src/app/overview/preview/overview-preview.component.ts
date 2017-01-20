import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../shared/model/event";
import {Tour} from "../../shared/model/tour";
import {Merchandise} from "../../shared/model/merchandise";
import {Party} from "../../shared/model/party";
import {NavigationService} from "../../shared/services/navigation.service";
@Component({
    selector: "overview-preview",
    templateUrl: "./overview-preview.component.html",
    styleUrls: ["./overview-preview.component.css"]
})
export class OverViewPreviewComponent implements OnInit {
    @Input() events: Event[];

    icons = {};
    iconKeys = Object.keys(this.icons);

    constructor(public navigationService: NavigationService) {

    }

    //format the date object and the price tag
    formatDetails(details: any): any {
        if (details instanceof Date) {
            return details.toLocaleString();
        }
        else if(typeof details === "number"){
            return details + "€";
        }
    }

    ngOnInit(): void {
        if (this.events[0] instanceof Merchandise) {
            this.icons = {priceMember: "monetization_on"};
        }
        //tour or party
        else {
            this.icons = {date: "date_range", priceMember: "monetization_on"};
        }

        this.iconKeys = Object.keys(this.icons);
    }

    showDetails(event: Event) {
        let url: string;
        if (event instanceof Merchandise) {
            url = `merch/${event.id}`;
        }
        else if (event instanceof Tour) {
            url = `tours/${event.id}`;
        }
        else if (event instanceof Party) {
            url = `partys/${event.id}`;
        }
        this.navigationService.navigateByUrl(url);
    }
}