import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ListFormType} from "../list-form-type";
import {MdDialog} from "@angular/material";
import {ChooseColorComponent} from "./choose-color/choose-color.component";
import {ModifyType} from "../modify-type";

@Component({
	selector: "memo-list-form",
	templateUrl: "./list-form.component.html",
	styleUrls: ["./list-form.component.scss"]
})
export class ListFormComponent implements OnInit {
	ListFormType = ListFormType;
	@Input() type: ListFormType;
	@Input() title: string;
	//todo
	@Input() list: (any)[];

	//todo type
	@Output() listChanged: EventEmitter<any> = new EventEmitter();

	constructor(private dialogService: MdDialog) {
	}

	ngOnInit() {
	}

	getHexFromString(color: string) {
		//TODO: weniger blöd machen
		if (color === "Weiss") {
			return "#ffffff"
		}
		if (color === "Blau") {
			return "#0000ff"
		}
		if (color === "Grün") {
			return "#00ff00";
		}
		return color;
	}

	openColorDialog(color) {
		let data = {};
		if (color) {
			data = {
				color: {
					hex: this.getHexFromString(color),
					//todo update once colors are stored as name/hex pair
					name: color
				}
			}
		}
		const dialogRef = this.dialogService.open(ChooseColorComponent, {data});
		dialogRef.afterClosed().first().subscribe(
			result => {
				if (result) {
					const index = this.list.indexOf(color);
					switch (result.listAction) {
						case ModifyType.ADD:
							//todo update once colors as name/hex pairs
							this.list.push(result.color.hex);
							break;
						case ModifyType.EDIT:
							//todo update once colors as name/hex pairs
							this.list.splice(index, 1, result.color.hex);
							break;
						case ModifyType.REMOVE:
							//todo update once colors as name/hex pairs
							this.list.splice(index, 1);
							break;
					}

					this.emitListChangedEvent();
				}
			}
		);
	}

	emitListChangedEvent() {
		console.log(this.list);
		this.listChanged.emit(this.list);
	}
}
