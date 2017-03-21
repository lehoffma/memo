import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {NavigationService} from "../../../shared/services/navigation.service";

@Component({
    selector: 'shopping-cart-badge',
    templateUrl: './shopping-cart-badge.component.html',
    styleUrls: ['./shopping-cart-badge.component.scss']
})
export class ShoppingCartBadgeComponent implements OnInit {

    public amountOfFiles: Observable<string> = this.shoppingCartService.amountOfFiles
        .map(amount => amount > 99 ? "99+" : amount + "");

    constructor(private navigationService: NavigationService,
                public shoppingCartService: ShoppingCartService) {

    }

    ngOnInit() {
    }

    takeToPage(url) {
        this.navigationService.navigateByUrl(url);
    }

}