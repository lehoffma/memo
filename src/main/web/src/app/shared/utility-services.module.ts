

import {ModuleWithProviders, NgModule} from "@angular/core";
import {ConfirmationDialogService} from "./services/confirmation-dialog.service";
import {EventFactoryService} from "./services/event-factory.service";
import {EventUtilityService} from "./services/event-utility.service";
import {NavigationService} from "./services/navigation.service";
import {QueryParameterService} from "./services/query-parameter.service";
import {ShoppingCartService} from "./services/shopping-cart.service";
import {WindowService} from "./services/window.service";


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
