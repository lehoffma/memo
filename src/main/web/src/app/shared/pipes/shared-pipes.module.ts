import {NgModule} from "@angular/core";
import {DateFormatPipe} from "./date-format.pipe";
import {ImageSizePipe} from "./image-size.pipe";
import { ClubRoleIconPipe } from './club-role-icon.pipe';


@NgModule({
	imports: [],
	exports: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe
	],
	declarations: [
		DateFormatPipe,
		ImageSizePipe,
		ClubRoleIconPipe
	],
	providers: [],
})
export class SharedPipesModule {
}
