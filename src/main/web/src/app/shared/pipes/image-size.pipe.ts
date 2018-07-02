import {Pipe, PipeTransform} from "@angular/core";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";

@Pipe({
	name: "imageSize"
})
export class ImageSizePipe implements PipeTransform {

	constructor(private breakpointObserver: BreakpointObserver) {
	}

	transform(path: string, size: string): Observable<string> {
		if (!path || !path.startsWith("/api/")) {
			return of(path)
		}


		return this.breakpointObserver.observe([
			"(min-width: 650px)"
		]).pipe(
			map(result => {
				const mobile = !result.matches;

				let apiSize = "original";
				switch (size) {
					case "thumbnail":
					case "small":
					case "medium":
					case "large":
						apiSize = size;
				}

				return path + "&size=" + apiSize;
			})
		)
	}

}
