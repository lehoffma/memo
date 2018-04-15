import {ModuleWithProviders, NgModule} from "@angular/core";
import {AddressService} from "./address.service";
import {CommentService} from "./comment.service";
import {EntryService} from "./entry.service";
import {EntryCategoryService} from "./entry-category.service";
import {EventService} from "./event.service";
import {ImageUploadService} from "./image-upload.service";
import {LogInService} from "./login.service";
import {OrderService} from "./order.service";
import {OrderedItemService} from "./ordered-item.service";
import {StockService} from "./stock.service";
import {UserService} from "./user.service";
import {UserBankAccountService} from "./user-bank-account.service";
import {HttpClientModule} from "@angular/common/http";
import {MemoMaterialModule} from "../../../../material.module";
import {MilesService} from "./miles.service";
import {CapacityService} from "./capacity.service";

const providers = [
	AddressService,
	CapacityService,
	CommentService,
	EntryService,
	EntryCategoryService,
	EventService,
	ImageUploadService,
	LogInService,
	MilesService,
	OrderService,
	OrderedItemService,
	StockService,
	UserService,
	UserBankAccountService,
];

@NgModule({
	imports: [
		HttpClientModule,
		MemoMaterialModule
	]
})
export class ApiServicesModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: ApiServicesModule,
			providers: [...providers]
		};
	}
}
