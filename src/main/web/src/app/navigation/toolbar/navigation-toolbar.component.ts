import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {NavigationService} from "../../shared/services/navigation.service";
import {Link} from "../../shared/model/link";
import {Observable} from "rxjs/Observable";
@Component({
    selector: "navigation-toolbar",
    templateUrl: "./navigation-toolbar.component.html",
    styleUrls: ["./navigation-toolbar.component.scss", "./element/navigation-toolbar-element.component.css"]
})
export class NavigationComponent implements OnInit {
    @Output() sideBarOpened = new EventEmitter();
    links: Observable<Link[]> = this.navigationService.toolbarLinks;
    accountLinks: Observable<Link[]> = this.navigationService.accountLinks;
    imagePath: string = "../../../resources/images/nils.PNG";
    loggedIn: boolean = true;   //todo: logInService

    constructor(private navigationService: NavigationService) {

    }

    ngOnInit() {

    }

    takeToPage(url: string) {
        this.navigationService.navigateByUrl(url);
    }

    sideBarChanged() {
        this.sideBarOpened.emit({
            value: true
        });
    }

}