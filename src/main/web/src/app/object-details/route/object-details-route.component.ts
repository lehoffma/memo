import {Component, OnInit, Input} from "@angular/core";

@Component({
    selector: 'details-route',
    templateUrl: './object-details-route.component.html',
    styleUrls: ["./object-details-route.component.scss"]
})
export class DetailsRouteComponent implements OnInit {
    @Input() tourRoute;

    constructor() {
    }

    ngOnInit() {
    }

}