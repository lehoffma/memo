import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "clothesSize"})
export class ClothesSizePipe implements PipeTransform {
	transform(sizeRange: { min: number, max: number }): any {
		if (sizeRange) {
			return `${sizeRange.min}-${sizeRange.max}`;
		}
		return "";
	}

}
