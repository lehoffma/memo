import {ModuleWithProviders, NgModule} from "@angular/core";
import {AddressService} from "./services/api/address.service";
import {CommentService} from "./services/api/comment.service";
import {EntryService} from "./services/api/entry.service";
import {EntryCategoryService} from "./services/api/entry-category.service";
import {EventService} from "./services/api/event.service";
import {ImageUploadService} from "./services/api/image-upload.service";
import {LogInService} from "./services/api/login.service";
import {OrderService} from "./services/api/order.service";
import {ParticipantsService} from "./services/api/participants.service";
import {StockService} from "./services/api/stock.service";
import {UserService} from "./services/api/user.service";
import {UserBankAccountService} from "./services/api/user-bank-account.service";
import {CacheStore} from "./cache/cache.store";
import {HttpClientModule} from "@angular/common/http";
import {MemoMaterialModule} from "../../material.module";

const providers = [
	AddressService,
	CommentService,
	EntryService,
	EntryCategoryService,
	EventService,
	ImageUploadService,
	LogInService,
	OrderService,
	ParticipantsService,
	StockService,
	UserService,
	UserBankAccountService,

	CacheStore
];

@NgModule({
	imports: [
		HttpClientModule,
		MemoMaterialModule
	]
})
export class ApiServicesModule{
	static forRoot() : ModuleWithProviders {
		return {
			ngModule: ApiServicesModule,
			providers: [...providers]
		};
	}}
