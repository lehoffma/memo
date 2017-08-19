import {animate, state, style, transition, trigger} from "@angular/animations";

//todo use for error messages globally?
export const Wiggle =
	trigger("wiggle", [
		state("1", style({transform: "translateX(0)"})),
		transition(":enter", [
			style({transform: "translateX(-100%)"}),
			animate("200ms ease-in"),
			style({transform: "translateX(100%)"}),
			animate("200ms ease-in"),
			style({transform: "translateX(-40%"}),
			animate("100ms ease-in"),
		]),
	]);
