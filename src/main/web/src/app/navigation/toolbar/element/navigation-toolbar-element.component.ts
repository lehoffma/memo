import {Component, Input, ViewChild} from "@angular/core";
import {Link} from "../../../shared/model/link";
import {Router} from "@angular/router";
import {MdMenu, MdButton, MdMenuTrigger} from "@angular/material";
import {NavigationService} from "../../../shared/services/navigation.service";
@Component({
    selector: "navigation-toolbar-element",
    templateUrl: "./navigation-toolbar-element.component.html",
    styleUrls: ["./navigation-toolbar-element.component.css"]
})
export class NavigationElementComponent {
    @Input() link: Link;

    constructor(public navigationService: NavigationService) {

    }

    activateRoute(route: string) {
        this.navigationService.navigateByUrl(route);
    }

    activateRouteIfNoChildren(route: string) {
        if (!this.link.children) {
            this.activateRoute(route);
        }
    }
}