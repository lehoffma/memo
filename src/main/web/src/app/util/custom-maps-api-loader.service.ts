import {ApplicationRef, Inject, Injectable} from "@angular/core";
import {LAZY_MAPS_API_CONFIG, LazyMapsAPILoader} from "@agm/core";
import {AppConfigService} from "../app-config.service";
import {map} from "rxjs/operators";
import {DocumentRef, WindowRef} from "@agm/core/utils/browser-globals";

@Injectable()
export class CustomMapsApiLoaderService extends LazyMapsAPILoader {
	constructor(private appConfigService: AppConfigService,
				private applicationRef: ApplicationRef,
				@Inject(LAZY_MAPS_API_CONFIG) config: any,
				w: WindowRef,
				d: DocumentRef) {
		super(config, w, d);
	}

	load(): Promise<any> {
		if (this._scriptLoadingPromise) {
			return this._scriptLoadingPromise;
		}

		return this.appConfigService.config$.pipe(
			map(config => {
				this._config = {
					...this._config,
					libraries: ["places"],
					apiKey: config.mapsApiKey
				};
				return super.load();
			})
		).toPromise();
	}
}
