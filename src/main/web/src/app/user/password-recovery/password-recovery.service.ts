import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class PasswordRecoveryService{

	private baseUrl = "/api/resetPassword";

	constructor(private http: HttpClient) {
	}


	requestPasswordReset(email: string){
		return this.http.post(this.baseUrl, {email});
	}
}
