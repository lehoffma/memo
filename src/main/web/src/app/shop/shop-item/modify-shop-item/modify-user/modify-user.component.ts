import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {User} from "../../../../shared/model/user";
import {ModifyItemEvent} from "../modify-item-event";
import {ModifyItemService} from "../modify-item.service";
import {ModifiedImages} from "../modified-images";

@Component({
	selector: "memo-modify-user",
	templateUrl: "./modify-user.component.html",
	styleUrls: ["./modify-user.component.scss"],
})
export class ModifyUserComponent implements OnInit {
	@Input() previousValue: any;
	@Input() mode: ModifyType;
	@Output() onSubmit: EventEmitter<ModifyItemEvent> = new EventEmitter();
	ModifyType = ModifyType;

	constructor(private location: Location,
				private modifyItemService: ModifyItemService) {
	}

	ngOnInit() {
	}

	cancel() {
		this.location.back();
		this.modifyItemService.reset();
	}

	submitModifiedObject(event: { item: User, images: ModifiedImages }) {
		this.onSubmit.emit(event);
	}
}
