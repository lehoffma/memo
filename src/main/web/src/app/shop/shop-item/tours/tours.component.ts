import {Component} from "@angular/core";
import {Router} from "@angular/router";

@Component({
	selector: "memo-tours",
	templateUrl: "./tours.component.html",
	styleUrls: ["./tours.component.scss"]
})
export class ToursComponent {
	constructor(private router: Router) {
		this.router.navigate(["search"], {queryParams: {category: "tours"}, replaceUrl: true});
	}
}
