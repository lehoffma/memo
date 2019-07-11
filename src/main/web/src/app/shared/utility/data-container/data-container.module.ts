import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DataContainerComponent, DataContainerEmptyStateActions, DataContainerErrorStateActions} from "./data-container.component";
import {MemoMaterialModule} from "../../../../material.module";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
  declarations: [DataContainerComponent, DataContainerEmptyStateActions, DataContainerErrorStateActions],
	imports: [
		CommonModule,
		MemoMaterialModule,
		FlexLayoutModule
	],
  exports: [DataContainerComponent, DataContainerEmptyStateActions, DataContainerErrorStateActions]
})
export class DataContainerModule { }
