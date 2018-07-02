import {ChangeDetectionStrategy, Component, HostListener, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material";


export enum KEY_CODE {
	RIGHT_ARROW = 39,
	LEFT_ARROW = 37
}

@Component({
	selector: "memo-item-image-popup",
	templateUrl: "./item-image-popup.component.html",
	styleUrls: ["./item-image-popup.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemImagePopupComponent implements OnInit {
	selected = -1;
	hideButtons = false;

	constructor(@Inject(MAT_DIALOG_DATA) public data: { imagePath: string, images: string[] }) {
		this.selected = this.data.images.indexOf(this.data.imagePath);
		this.hideButtons = this.data.images.length === 1;
	}

	@HostListener("keydown", ["$event"]) onKeyDown(event: KeyboardEvent) {
		if (event.key === "ArrowLeft") {
			this.prev();
		}
		if (event.key === "ArrowRight") {
			this.next()
		}
	}

	ngOnInit() {
	}

	next() {
		const length = this.data.images.length;
		this.selected = (this.selected + 1) % length;
	}

	prev() {
		this.selected = this.selected === 0 ? (this.data.images.length - 1) : this.selected - 1;
	}
}
