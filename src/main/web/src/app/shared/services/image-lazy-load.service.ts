import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Dimension} from "./window.service";
import {HttpClient} from "@angular/common/http";
import {Cache} from "../cache/cache";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {map, tap, delay} from "rxjs/operators";


@Injectable({
	providedIn: "root"
})
export class ImageLazyLoadService {
	private cacheMap: {
		[url: string]: Cache<SafeUrl>
	} = {};

	private loadingCache: {
		[url: string]: BehaviorSubject<boolean>
	} = {};

	public hasBeenLoadedOnce: {
		[url: string]: boolean;
	} = {};

	private getUrl(filename: string, dimensions: Dimension) {
		const mobile = dimensions.width < 700;
		return mobile
			? "/resources/images/" + filename + "-small.jpg"
			: "/resources/images/" + filename + ".jpg";
	}

	public hasBeenLoaded(filename: string, dimensions: Dimension){
		const url = this.getUrl(filename, dimensions);
		return this.hasBeenLoadedOnce[url];
	}

	public loading(filename: string, dimensions: Dimension): Observable<boolean> {
		const url = this.getUrl(filename, dimensions);
		return this.loadingCache[url];
	}

	constructor(private http: HttpClient,
				private sanitizer: DomSanitizer) {
	}

	public getImage(filename: string, dimensions: Dimension): Observable<SafeUrl> {
		const url = this.getUrl(filename, dimensions);

		if (!this.cacheMap[url]) {
			this.loadingCache[url] = new BehaviorSubject(true);
			this.hasBeenLoadedOnce[url] = false;
			this.cacheMap[url] = new Cache(() => this.http.get(url, {responseType: "blob"}).pipe(
				map(image => this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image))),
				tap(() => this.loadingCache[url].next(false)),
				tap(() => this.hasBeenLoadedOnce[url] = true)
			));
		}

		return this.cacheMap[url].get();
	}

}
