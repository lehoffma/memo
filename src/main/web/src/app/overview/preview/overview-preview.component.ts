import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../shared/model/event";
import {Merchandise} from "../../shared/model/merchandise";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs";
@Component({
    selector: "overview-preview",
    templateUrl: "./overview-preview.component.html",
    styleUrls: ["./overview-preview.component.css"]
})
export class OverViewPreviewComponent implements OnInit {
    @Input() events: Observable<Event[]>;
    @Input() route: string;

    showDate = false;

    constructor(public navigationService: NavigationService) {

    }

    ngOnInit(): void {
        this.events.subscribe(
            events => {
                if (events[0]) {
                    this.showDate = !(events[0] instanceof Merchandise);
                }
            }
        );
    }

    showDetails(event: Event) {
        this.navigationService.navigateByUrl(`${this.route}/${event.id}`);
    }
}