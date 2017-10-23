import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

interface ImageToUpload {
	name: string;
	data: any
}

@Component({
	selector: 'memo-multi-image-upload',
	templateUrl: './multi-image-upload.component.html',
	styleUrls: ['./multi-image-upload.component.scss'],
})
export class MultiImageUploadComponent implements OnInit {
	imagesToUpload$: BehaviorSubject<ImageToUpload[]> = new BehaviorSubject([]);

	images$ = this.imagesToUpload$.map(images => images.map(it => it.data));

	constructor() {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {FileList} fileList
	 */
	addImages(fileList: FileList) {
		const addedImages$ = new BehaviorSubject<ImageToUpload[]>([]);

		for (let i = 0; i < fileList.length; i++) {
			(() => {
				const reader = new FileReader();

				reader.onload = (event) => {
					const currentValue = addedImages$.getValue();
					currentValue.push({
						name: fileList.item(i).name,
						data: (<any>event.target).result
					});
					addedImages$.next(currentValue);
				};

				reader.readAsDataURL(fileList.item(i));
			})();
		}

		addedImages$
		//only update the list if all images have been read by the file reader
			.filter(images => images.length === fileList.length)
			.take(1)
			.subscribe(images => {
				const currentValue = this.imagesToUpload$.getValue();
				images.forEach(image => currentValue.push(image));
				this.imagesToUpload$.next(currentValue);
			})
	}

	/**
	 *
	 * @param {number} index
	 */
	deleteImage(index: number) {
		const currentValue = this.imagesToUpload$.getValue();
		currentValue.splice(index, 1);
		this.imagesToUpload$.next([...currentValue]);
	}

	/**
	 *
	 */
	deleteAllImages() {
		this.imagesToUpload$.next([]);
	}

	/**
	 *
	 * @param event
	 */
	onFileSelect(event) {
		const fileList: FileList = event.target.files;
		const fileCount: number = fileList.length;
		const formData = new FormData();
		if (fileCount > 0) { // a file was selected
			for (let i = 0; i < fileCount; i++) {
				formData.append("file[]", fileList.item(i));
			}
			//todo etwas mit formdata machen

			this.addImages(fileList);
		}
	}
}
