import {Component, Output, EventEmitter, OnInit} from "@angular/core";
import {NavigationService} from "../../shared/services/navigation.service";
import {Link} from "../../shared/model/link";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";
import {User} from "../../shared/model/user";
import {UserStore} from "../../shared/stores/user.store";
@Component({
    selector: "navigation-toolbar",
    templateUrl: "./navigation-toolbar.component.html",
    styleUrls: ["./navigation-toolbar.component.css", "./element/navigation-toolbar-element.component.css"]
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

    takeToLoginPage() {
        this.navigationService.navigateByUrl("/login");
    }

    sideBarChanged() {
        this.sideBarOpened.emit({
            value: true
        });
    }

}