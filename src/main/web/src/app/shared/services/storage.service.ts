import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {Optional} from "../utility/optional";
import {isPlatformBrowser} from "@angular/common";

@Injectable()
export class StorageService {

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
	}

	local(): Optional<Storage> {
		if (isPlatformBrowser(this.platformId)) {
			// Client only code.
			return Optional.of(localStorage);
		}
		return Optional.empty();
	}


	session(): Optional<Storage> {
		if (isPlatformBrowser(this.platformId)) {
			// Client only code.
			return Optional.of(sessionStorage);
		}
		return Optional.empty();
	}

}
