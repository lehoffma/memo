import {NgModule} from "@angular/core";
import {DateFormatPipe} from "./date-format.pipe";
import {ImageSizePipe} from "./image-size.pipe";
import {ClubRoleIconPipe} from "./club-role-icon.pipe";
import {PipeFunction} from "./function.pipe";


@NgModule({
	imports: [],
	exports: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe,
		PipeFunction
	],
	declarations: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe,
		PipeFunction
	],
	providers: [],
})
export class SharedPipesModule {
}
