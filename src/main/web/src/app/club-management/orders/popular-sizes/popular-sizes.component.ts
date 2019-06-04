import {Component, Input, OnInit} from "@angular/core";
import {PopularSize} from "../order-overview.service";

@Component({
	selector: "memo-popular-sizes",
	templateUrl: "./popular-sizes.component.html",
	styleUrls: ["./popular-sizes.component.scss"]
})
export class PopularSizesComponent implements OnInit {
	@Input() sizes: PopularSize[];
	@Input() error: any;

	constructor() {
	}

	ngOnInit() {
	}

}
