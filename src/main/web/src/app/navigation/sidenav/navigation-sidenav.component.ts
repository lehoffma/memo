import {Component, OnInit, Output, EventEmitter} from "@angular/core";
import {Link} from "../../shared/model/link";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs/Observable";
@Component({
    selector: "navigation-sidenav",
    templateUrl: "./navigation-sidenav.component.html",
    styleUrls: ["./navigation-sidenav.component.css"]
})
export class NavigationSideNavComponent implements OnInit {
    @Output() sideBarClosed = new EventEmitter();

    public links: Observable<Link[]> = this.navigationService.sidenavLinks;
    //todo: private accountObservable:Account;

    constructor(private navigationService: NavigationService) {

    }

    ngOnInit() {

    }

    closeSideNav() {
        this.sideBarClosed.emit({
            value: true
        });
    }
}