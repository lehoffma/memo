import {Component, Input, OnInit} from "@angular/core";
import {PopularColor} from "../order-overview.service";

@Component({
	selector: "memo-popular-colors",
	templateUrl: "./popular-colors.component.html",
	styleUrls: ["./popular-colors.component.scss"]
})
export class PopularColorsComponent implements OnInit {
	@Input() colors: PopularColor[];
	@Input() error: any;

	constructor() {
	}

	ngOnInit() {
	}

}
