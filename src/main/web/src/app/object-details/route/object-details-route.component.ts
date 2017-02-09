import {Component, OnInit, Input} from "@angular/core";
import {NavigationService} from "../../shared/services/navigation.service";

@Component({
    selector: 'details-route',
    templateUrl: './object-details-route.component.html',
    styleUrls: ["./object-details-route.component.scss"]
})
export class DetailsRouteComponent implements OnInit {
    @Input() tourRoute;

    constructor(private navigationService: NavigationService) {
    }

    ngOnInit() {
    }

    openRouteOnGoogleMaps(tourRoute) {
        this.navigationService.navigateByUrl("redirect");
    }

}