import {Injectable} from "@angular/core";
import {HttpBackend, HttpClient} from "@angular/common/http";

@Injectable()
export class UnauthorizedHttpClient extends HttpClient {
	constructor(handler: HttpBackend) {
		super(handler);
	}
}
