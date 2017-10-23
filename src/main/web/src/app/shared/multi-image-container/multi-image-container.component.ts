import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Component({
	selector: 'memo-multi-image-container',
	templateUrl: './multi-image-container.component.html',
	styleUrls: ['./multi-image-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiImageContainerComponent implements OnInit {
	SWIPE_ACTIONS = {
		LEFT: "left",
		RIGHT: "right"
	};

	_images$: BehaviorSubject<string[]> = new BehaviorSubject([]);
	images$: Observable<string[]> = this._images$
		.scan((acc: string[], values: string[]) => {
			//remove values that are present in old value but not in new
			for (let i = acc.length - 1; i >= 0; i--) {
				if (!values.find(it => it === acc[i])) {
					acc.splice(i, 1);
				}
			}

			//add values that are present in new value but not in old
			values.filter(value => !acc.find(it => value === it))
				.forEach(value => acc.push(value));

			return acc;
		}, []);


	get images() {
		return this._images$.getValue();
	}

	@Input()
	set images(images: string[]) {
		this._images$.next(images);

		//currently selected image was deleted
		if (images && !images.find(image => this.currentImage === image)) {
			this.currentImage = images.length > 0 ? images[0] : "";
		}
	}

	_currentImage$: BehaviorSubject<string> = new BehaviorSubject("");

	get currentImage() {
		return this._currentImage$.getValue();
	}

	set currentImage(image: string) {
		this._currentImage$.next(image);
	}
	;

	constructor() {
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
