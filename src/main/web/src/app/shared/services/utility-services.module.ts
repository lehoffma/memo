import {ModuleWithProviders, NgModule} from "@angular/core";
import {ConfirmationDialogService} from "./confirmation-dialog.service";
import {EventFactoryService} from "./event-factory.service";
import {EventUtilityService} from "./event-utility.service";
import {NavigationService} from "./navigation.service";
import {QueryParameterService} from "./query-parameter.service";
import {ShoppingCartService} from "./shopping-cart.service";
import {WindowService} from "./window.service";


const providers = [
	ConfirmationDialogService,
	EventFactoryService,
	EventUtilityService,
	NavigationService,
	QueryParameterService,
	ShoppingCartService,
	WindowService
];

@NgModule({
	imports: []
})
export class UtilityServicesModule{
	static forRoot() : ModuleWithProviders {
		return {
			ngModule: UtilityServicesModule,
			providers: [...providers]
		};
	}
}
