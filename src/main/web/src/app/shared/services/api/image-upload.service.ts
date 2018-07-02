import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

export interface ImageUploadApiResponse {
	images: string[];
}

@Injectable()
export class ImageUploadService {
	baseUrl = "/api/image";

	constructor(private http: HttpClient) {
	}


	dataURItoBlob(dataURI: string): Blob {
		// convert base64/URLEncoded data component to raw binary data held in a string
		let byteString;
		if (dataURI.split(",")[0].indexOf("base64") >= 0)
			byteString = atob(dataURI.split(",")[1]);
		else
			byteString = decodeURI(dataURI.split(",")[1]);

		// separate out the mime component
		const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

		// write the bytes of the string to a typed array
		const uint8Array = new Uint8Array(byteString.length);
		for (let i = 0; i < byteString.length; i++) {
			uint8Array[i] = byteString.charCodeAt(i);
		}

		console.log(mimeString);
		return new Blob([uint8Array], {type: mimeString});
	}

	uploadImages(formData: FormData): Observable<ImageUploadApiResponse> {
		return this.http.post<ImageUploadApiResponse>(this.baseUrl, formData)
	}

	deleteImage(apiPath: string): Observable<Object> {
		return this.http.delete(this.baseUrl, {
			params: new HttpParams().set("fileName", apiPath)
		});
	}
}
