import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "removeDuplicates"
})
export class RemoveDuplicatesPipe<T> implements PipeTransform {

	transform(list: T[], equality: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
		return list
			.filter((value, index, array) => array.findIndex(it => equality(value, it)) === index)
	}

}
