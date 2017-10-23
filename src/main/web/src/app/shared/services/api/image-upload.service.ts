import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Rx";

export interface ImageUploadApiResponse {
	imagePath: string;
}

@Injectable()
export class ImageUploadService {
	baseUrl = "/api/image";

	constructor(private http: HttpClient) {
	}


	uploadImage(formData: FormData): Observable<ImageUploadApiResponse> {
		return this.http.post<ImageUploadApiResponse>(this.baseUrl, formData)
	}
}
