import {Injectable} from "@angular/core";
import {Link} from "../model/link";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";


@Injectable()
export class NavigationService {
    public toolbarLinks: Observable<Link[]>;
    public sidenavLinks: Observable<Link[]>;
    public accountLinks: Observable<Link[]>;

    constructor(private http: Http,
                private router: Router) {
        this.initialize();
    }

    private initialize() {
        this.toolbarLinks = this.http.get("/resources/toolbar-links.json")
            .map(response => response.json());
        this.sidenavLinks = this.http.get("/resources/sidenav-links.json")
            .map(response => response.json());
        this.accountLinks = this.http.get("/resources/account-links.json")
            .map(response => response.json());
    }

    //todo: do something other than just printing to console (show the error to the user or fallback to some default route)
    public navigateByUrl(url:string):void{
        this.router.navigateByUrl(url)
            .then(
                _ => _, //navigation was successful
                reason => console.error(`navigation failed, reason: ${reason}`)
            )
            .catch(
                error => console.error(`error occurred while navigating, error message: ${error}`)
            )
    }
}