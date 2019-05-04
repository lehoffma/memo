import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import { ProgressiveImageSrcDirective } from './progressive-image-src.directive';

@NgModule({
	declarations: [ProgressiveImageSrcDirective],
	imports: [
		CommonModule
	],
	exports: [ProgressiveImageSrcDirective]
})
export class ProgressiveImageLoadingModule {
}
