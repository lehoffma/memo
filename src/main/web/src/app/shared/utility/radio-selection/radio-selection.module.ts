import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RadioSelectionComponent} from "./radio-selection.component";
import {FormsModule} from "@angular/forms";

@NgModule({
	declarations: [RadioSelectionComponent,],
	imports: [
		CommonModule,
		FormsModule,
	],
	exports: [
		RadioSelectionComponent
	]
})
export class RadioSelectionModule {
}
