import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ModifyType} from "../modify-type";
import {Location} from "@angular/common";
import {User} from "../../../../shared/model/user";
import {ImageToUpload} from "../../../../shared/multi-image-upload/multi-image-upload.component";
import {ModifyItemEvent} from "../modify-item-event";
import {ModifyItemService} from "../modify-item.service";

@Component({
	selector: "memo-modify-user",
	templateUrl: "./modify-user.component.html",
	styleUrls: ["./modify-user.component.scss"]
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

	submitModifiedObject(event: { user: User, images: { imagePaths: string[], imagesToUpload: ImageToUpload[] } }) {
		this.onSubmit.emit({
			item: event.user,
			images: event.images
		});
	}
}
