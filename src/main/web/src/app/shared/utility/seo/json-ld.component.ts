import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from "@angular/core";

@Component({
	selector: "json-ld",
	template: ``,
	styles: [""],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JSONLdComponent implements OnInit {
	private _json: SafeHtml;
	@Input()
	@HostBinding("innerHtml")
	set json(v: any) {
		this._json = this.getSafeHtml(v);
	}

	get json() {
		return this._json;
	}

	constructor(private sanitizer: DomSanitizer) {
	}

	ngOnInit() {
	}

	private getSafeHtml(value: object) {
		const json = value
			? JSON.stringify(value, null, 2).replace(/<\/script>/g, "<\\/script>")
			: "";
		const html = `<script type="application/ld+json">${json}</script>`;
		return this.sanitizer.bypassSecurityTrustHtml(html);
	}
}
