import {Component, Input, OnInit} from "@angular/core";
import {Location} from "@angular/common";

@Component({
	selector: "memo-error-page",
	template: `
		<div class="sad-emoji">😞</div>
		<div class="error-code">
			{{errorCode}}
		</div>
		<div class="error-message">
			{{errorMessage}}
		</div>
		<div class="actions">
			<button mat-raised-button color="primary" (click)="location.back()">
				Zurück
			</button>
			<a mat-raised-button color="primary" routerLink="/">
				Startseite
			</a>
		</div>
	`,
	styles: [`
		:host {
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			height: calc(100% - 204px);
		}

		.sad-emoji {
			font-size: 10rem;
		}

		.error-code {
			font-size: 8rem;
		}

		.error-message {
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
