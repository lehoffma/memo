import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {scan} from "rxjs/operators";


@Component({
	selector: "memo-multi-image-container",
	templateUrl: "./multi-image-container.component.html",
	styleUrls: ["./multi-image-container.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiImageContainerComponent implements OnInit {
	SWIPE_ACTIONS = {
		LEFT: "left",
		RIGHT: "right"
	};

	_images$: BehaviorSubject<string[]> = new BehaviorSubject([]);
	images$: Observable<string[]> = this._images$
		.pipe(
			scan((acc: string[], values: string[]) => {
				//remove values that are present in old value but not in new
				for (let i = acc.length - 1; i >= 0; i--) {
					if (!values.find(it => it === acc[i])) {
						acc.splice(i, 1);
					}
				}

				//add values that are present in new value but not in old
				values.filter(value => !acc.find(it => value === it))
					.forEach(value => acc.push(value));

				//reorder values that have been reordered
				if (acc.some((value, index, array) => values.indexOf(value) !== index)) {
					return values;
				}

				return acc;
			}, [])
		);
	_currentImage$: BehaviorSubject<string> = new BehaviorSubject("");
	@Output() onClick = new EventEmitter<any>();

	constructor() {
	}

	get images() {
		return this._images$.getValue();
	}

	@Input()
	set images(images: string[]) {
		if (images === null) {
			return;
		}
		this._images$.next(images);

		//currently selected image was deleted
		if (images && !images.find(image => this.currentImage === image)) {
			this.currentImage = images.length > 0 ? images[0] : "";
		}
	}

	get currentImage() {
		return this._currentImage$.getValue();
	}

	set currentImage(image: string) {
		this._currentImage$.next(image);
	}

	ngOnInit() {
	}


	swipe(direction: "left" | "right", currentIndex: number) {
		switch (direction) {
			case "left":
				this.currentImage = currentIndex > 0 ? this.images[currentIndex - 1] : this.currentImage;
				break;
			case "right":
				this.currentImage = currentIndex < this.images.length - 1
					? this.images[currentIndex + 1]
					: this.currentImage;
				break;
		}
	}

}
