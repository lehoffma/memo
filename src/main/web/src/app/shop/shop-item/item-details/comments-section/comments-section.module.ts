import {NgModule} from "@angular/core";
import {CommentsSectionComponent} from "./comments-section.component";
import {CommentBlockComponent} from "./comment-block/comment-block.component";
import {CommentInputComponent} from "./comment-block/comment-input/comment-input.component";
import {EditCommentDialogComponent} from "./edit-comment-dialog/edit-comment-dialog.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../../material.module";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../../../shared/shared.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		SharedModule,
		MemoMaterialModule
	],
	declarations: [
		CommentsSectionComponent,
		CommentBlockComponent,
		CommentInputComponent,
		EditCommentDialogComponent
	],
	entryComponents: [
		EditCommentDialogComponent
	],
	exports: [
		CommentsSectionComponent
	]
})
export class CommentsSectionModule {
}
