import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "pipeFunction"
})
export class PipeFunction implements PipeTransform {
	public transform<T, U>(value: T, handler: (value: T, ...options: any) => U, ...options: any[]): U {
		return handler(value, ...options);
	}
}
