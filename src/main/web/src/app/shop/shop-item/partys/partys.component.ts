import {Component} from "@angular/core";
import {Router} from "@angular/router";


@Component({
	selector: "memo-partys",
	templateUrl: "./partys.component.html",
	styleUrls: ["./partys.component.scss"]
})
export class PartysComponent {
	constructor(private router: Router) {
		this.router.navigate(["search"], {queryParams: {category: "partys"}, replaceUrl: true});
	}
}
