package memo.auth.api;

import memo.model.Address;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.userHasCorrectPermission;
import static memo.auth.api.AuthenticationConditionFactory.userIsLoggedIn;

public class AddressAuthStrategy implements AuthenticationStrategy<Address> {
    @Override
    public boolean isAllowedToRead(User user, Address object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //address is part of item: fulfills read role of shopItem
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(Address::getItem, ShopItem::getExpectedReadRole)
                        .and(userIsLoggedIn()),
                //  address is part of user: is author or fulfills userManagement permission
                (AuthenticationConditionFactory.userIsAuthor(Address::getUser)
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.read))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }

    @Override
    public boolean isAllowedToCreate(User user, Address object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //address is part of item: fulfills read role of shopItem
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(Address::getItem, ShopItem::getExpectedWriteRole)
                        .and(userIsLoggedIn()),
                //  address is part of user: is author or fulfills userManagement permission
                (AuthenticationConditionFactory.userIsAuthor(Address::getUser)
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.create))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Address object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //address is part of item: fulfills read role of shopItem
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(Address::getItem, ShopItem::getExpectedWriteRole)
                        .and(userIsLoggedIn()),
                //  address is part of user: is author or fulfills userManagement permission
                (AuthenticationConditionFactory.userIsAuthor(Address::getUser)
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.write))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Address object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //address is part of item: fulfills read role of shopItem
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(Address::getItem, ShopItem::getExpectedWriteRole)
                        .and(userIsLoggedIn()),
                //  address is part of user: is author or fulfills userManagement permission
                (AuthenticationConditionFactory.userIsAuthor(Address::getUser)
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.delete))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }
}
