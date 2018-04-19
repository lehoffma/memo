import {animate, query, state, style, transition, trigger} from "@angular/animations";

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


export const fadeAnimation =
	trigger("fadeAnimation", [
		transition("* => *", [
			query(":enter",
				[
					style({opacity: 0})
				],
				{optional: true}
			),
			query(":leave",
				[
					style({opacity: 1}),
					animate("0.2s", style({opacity: 0}))
				],
				{optional: true}
			),
			query(":enter",
				[
					style({opacity: 0}),
					animate("0.2s", style({opacity: 1}))
				],
				{optional: true}
			)
		])
	]);
