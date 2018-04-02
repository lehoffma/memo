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
			<button mat-raised-button color="accent" (click)="location.back()">
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
			justify-content: center;
			flex-direction: column;
			align-items: center;
			position: absolute;
			background: #43a047;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
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
