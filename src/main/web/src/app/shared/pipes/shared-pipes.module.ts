import {NgModule} from "@angular/core";
import {DateFormatPipe} from "./date-format.pipe";
import {ImageSizePipe} from "./image-size.pipe";
import {ClubRoleIconPipe} from "./club-role-icon.pipe";
import {PipeFunction} from "./function.pipe";
import { RelativeDateFormatPipe } from './relative-date-format.pipe';


@NgModule({
	imports: [],
	exports: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe,
		PipeFunction,
		RelativeDateFormatPipe
	],
	declarations: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe,
		PipeFunction,
		RelativeDateFormatPipe
	],
	providers: [],
})
export class SharedPipesModule {
}
