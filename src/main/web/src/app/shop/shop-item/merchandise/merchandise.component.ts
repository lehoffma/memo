import {Component} from "@angular/core";
import {Router} from "@angular/router";


@Component({
	selector: "memo-merchandise",
	templateUrl: "./merchandise.component.html",
	styleUrls: ["./merchandise.component.scss"]
})
export class MerchandiseComponent {
	constructor(private router: Router) {
		this.router.navigate(["search"], {queryParams: {category: "merch"}, replaceUrl: true});
	}
}
