package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.auth.api.AuthenticationPredicateFactory;
import memo.data.util.PredicateFactory;
import memo.model.Address;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.userHasCorrectPermission;
import static memo.auth.api.AuthenticationConditionFactory.userIsLoggedIn;
import static memo.auth.api.AuthenticationPredicateFactory.*;

public class AddressAuthStrategy implements AuthenticationStrategy<Address> {
    @Override
    public boolean isAllowedToRead(User user, Address object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //address is part of item: fulfills read role of shopItem
                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(Address::getItem, ShopItem::getExpectedReadRole),
                //  address is part of user: is author or fulfills userManagement permission
                (AuthenticationConditionFactory.userIsAuthor(Address::getUser)
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.read))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getTour(), Permission.read))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getParty(), Permission.read))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Address> root, User user) {
        //if user is logged in:
        //address is part of item: fulfills read role of shopItem
//        todo always returns false for newly created addresses, no idea why though
//        Predicate userFulfillsMinimumRoleOfItem = userFulfillsMinimumRoleOfItem(builder, user, root,
//                addressRoot -> addressRoot.get("item"), "expectedReadRole");

        //  address is part of user: is author or fulfills userManagement permission
        Predicate isAnyAuthor = AuthenticationPredicateFactory.userIsAuthor(builder, root, user,
                addressRoot -> PredicateFactory.get(addressRoot, "user", "id"));
        Predicate hasCorrectPermissions = userHasCorrectPermissions(builder, user, Permission.read,
                "userManagement", "tour", "party");

        Predicate isAuthorOrHasPermissions = builder.or(isAnyAuthor, hasCorrectPermissions);

        //if user is logged out:
        //  address is neither part of item nor of user

        Predicate neitherPartOfItemNorOfUser = valuesAreNull(builder, root, "item", "user");
        Predicate isNewlyCreatedObject = builder.and(neitherPartOfItemNorOfUser);

        return builder.or(
//                userFulfillsMinimumRoleOfItem,
                isAuthorOrHasPermissions,
                isNewlyCreatedObject
        );
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
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.create))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getTour(), Permission.create))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getParty(), Permission.create))),

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
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.write))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getTour(), Permission.write))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getParty(), Permission.write))),

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
                        .or(userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.delete))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getTour(), Permission.delete))
                        .or(userHasCorrectPermission(it -> it.getPermissions().getParty(), Permission.delete))),

                //if user is logged out:
                //  address is neither part of item nor of user
                AuthenticationConditionFactory.<Address>userIsLoggedOut()
                        .and((user1, address) -> address.getItem() == null && address.getUser() == null)
        ));
    }
}
