import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

export interface ImageUploadApiResponse {
	images: string[];
}

@Injectable()
export class ImageUploadService {
	baseUrl = "/api/image";

	constructor(private http: HttpClient) {
	}


	uploadImages(formData: FormData): Observable<ImageUploadApiResponse> {
		return this.http.post<ImageUploadApiResponse>(this.baseUrl, formData)
	}
}
