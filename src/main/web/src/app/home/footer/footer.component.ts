import {Component, OnInit} from "@angular/core";
import {getYear} from "date-fns";

@Component({
	selector: "memo-footer",
	templateUrl: "./footer.component.html",
	styleUrls: ["./footer.component.scss"]
})
export class FooterComponent implements OnInit {
	constructor() {
	}

	ngOnInit() {
	}

	getYear() {
		return getYear(new Date());
	}
}
