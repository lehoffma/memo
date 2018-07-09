package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.util.PredicateFactory;
import memo.model.Address;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.*;
import java.util.Arrays;
import java.util.Optional;

import static memo.auth.api.AuthenticationConditionFactory.userHasCorrectPermission;
import static memo.auth.api.AuthenticationConditionFactory.userIsLoggedIn;

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

        Optional<Path<ShopItem>> addressItem = PredicateFactory.get(root, "item");
        Optional<Path<User>> addressUser = PredicateFactory.get(root, "user");

        Predicate isNewlyCreatedObject = builder.and(
                addressItem.map(builder::isNull).orElse(PredicateFactory.isFalse(builder)),
                addressUser.map(builder::isNull).orElse(PredicateFactory.isFalse(builder))
        );

        if (user == null) {
            return isNewlyCreatedObject;
        }

        Expression<Boolean> userHasPermissions = builder.<Boolean>selectCase()
                .when(
                        addressItem
                                .map(item -> builder.and(
                                        builder.isNotNull(item),
                                        PredicateFactory.get(item, "type")
                                                .map(type -> builder.equal(type, 1))
                                                .orElse(PredicateFactory.isFalse(builder))
                                ))
                                .orElse(PredicateFactory.isFalse(builder))
                        ,
                        user.getPermissions().getTour().toValue() >= Permission.read.toValue()
                )
                .when(
                        addressItem
                                .map(item -> builder.and(
                                        builder.isNotNull(item),
                                        PredicateFactory.get(item, "type")
                                                .map(type -> builder.equal(type, 2))
                                                .orElse(PredicateFactory.isFalse(builder))
                                ))
                                .orElse(PredicateFactory.isFalse(builder))
                        ,
                        user.getPermissions().getParty().toValue() >= Permission.read.toValue()
                )
                .when(
                        addressUser
                                .map(builder::isNotNull)
                                .orElse(PredicateFactory.isFalse(builder))
                        ,
                        user.getPermissions().getUserManagement().toValue() >= Permission.read.toValue()
                )
                .otherwise(false);

        Predicate userIsAuthor = addressUser
                .map(it -> builder.and(
                        builder.isNotNull(it),
                        PredicateFactory.get(it, "id")
                                .map(id -> builder.equal(id, user.getId()))
                                .orElse(PredicateFactory.isFalse(builder))
                ))
                .orElse(PredicateFactory.isFalse(builder));

        return builder.or(
                userIsAuthor,
                builder.isTrue(userHasPermissions),
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
