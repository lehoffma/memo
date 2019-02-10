import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
	name: "pipeFunction"
})
export class PipeFunction implements PipeTransform {
	public transform(value: any, handler: (value: any, ...options: any) => any, ...options: any[]): any {
		return handler(value, ...options);
	}
}
