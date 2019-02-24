import {Component, Input, OnInit} from "@angular/core";
import {Location} from "@angular/common";

@Component({
	selector: "memo-error-page",
	template: `
		<div class="sad-emoji">😞</div>
		<div class="error-code">
			{{errorCode}}
		</div>
		<div class="message">
			{{errorMessage}}
		</div>
		<div class="actions">
			<button mat-button (click)="location.back()">
				Zurück
			</button>
			<a mat-raised-button color="accent" routerLink="/">
				Startseite
			</a>
		</div>
	`,
	styles: [`
		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			min-height: 100vh;
			width: 100%;
			padding-top: 32px;
			padding-bottom: 32px;
		}

		.sad-emoji {
			font-size: 10rem;
		}

		.error-code {
			font-size: 8rem;
		}

		.message {
			text-align: center;
		}

		.actions {
			margin-top: 15px;
		}

		.actions > a {
			margin-left: 15px;
		}
	`]
})

export class ErrorPageComponent implements OnInit {
	@Input() errorCode: string;
	@Input() errorMessage: string;

	constructor(public location: Location) {
	}

	ngOnInit() {
	}
}
