import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UnauthorizedHttpClient} from "../../shared/authentication/unauthorized-http-client.service";

@Injectable()
export class PasswordRecoveryService {

	private baseUrl = "/api/resetPassword";

	constructor(private http: HttpClient,
				private unauthorizedHttp: UnauthorizedHttpClient) {
	}


	requestPasswordReset(email: string) {
		return this.http.post(this.baseUrl, {email});
	}

	resetPassword(newPassword: string, authToken: string) {
		return this.unauthorizedHttp.put(this.baseUrl, {password: newPassword}, {
			"headers": new HttpHeaders().append("Authorization", "Bearer " + authToken)
		});
	}
}
