package memo.auth.api;

import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.ListBuilder;

import java.util.Arrays;
import java.util.function.BiPredicate;
import java.util.function.Function;
import java.util.stream.Collectors;

import static memo.auth.api.ShopItemAuthHelper.getEventPermission;

public class ShopItemAuthStrategy implements AuthenticationStrategy<ShopItem> {
    @Override
    public boolean isAllowedToRead(User user, ShopItem object) {

        return userIsAuthorized(user, object,
                new ListBuilder<BiPredicate<User, ShopItem>>()
                        //the user is one of the authors
                        .buildAll(object.getAuthor().stream()
                                .map(it -> AuthenticationConditionFactory.<ShopItem>userIsAuthor(o -> it))
                                .collect(Collectors.toList()))
                        //or the user fulfills the expected role (or the item's exp. role is "Gast" if he's logged out)
                        .buildAdd(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Function.identity(),
                                ShopItem::getExpectedReadRole
                        ))
                        //or the user fulfills the permission requirements
                        .buildAdd(AuthenticationConditionFactory.userHasCorrectPermission(
                                user1 -> getEventPermission(user1, object), Permission.read
                        ))
        );
    }

    @Override
    public boolean isAllowedToCreate(User user, ShopItem object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user fulfills the permission requirements (=> has to be logged in)
                AuthenticationConditionFactory.userHasCorrectPermission(
                        user1 -> getEventPermission(user1, object), Permission.create
                )
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, ShopItem object) {
        return userIsAuthorized(user, object,
                new ListBuilder<BiPredicate<User, ShopItem>>()
                        //the user is one of the authors
                        .buildAll(object.getAuthor().stream()
                                .map(it -> AuthenticationConditionFactory.<ShopItem>userIsAuthor(o -> it))
                                .collect(Collectors.toList()))
                        //or the user fulfills the expected role (or the item's exp. role is "Gast" if he's logged out)
                        .buildAdd(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Function.identity(),
                                ShopItem::getExpectedWriteRole
                        ))
                        //or the user fulfills the permission requirements
                        .buildAdd(AuthenticationConditionFactory.userHasCorrectPermission(
                                user1 -> getEventPermission(user1, object), Permission.write
                        ))
        );
    }

    @Override
    public boolean isAllowedToDelete(User user, ShopItem object) {
        return userIsAuthorized(user, object,
                new ListBuilder<BiPredicate<User, ShopItem>>()
                        //the user is one of the authors
                        .buildAll(object.getAuthor().stream()
                                .map(it -> AuthenticationConditionFactory.<ShopItem>userIsAuthor(o -> it))
                                .collect(Collectors.toList()))
                        //or the user fulfills the expected role (or the item's exp. role is "Gast" if he's logged out)
                        .buildAdd(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Function.identity(),
                                ShopItem::getExpectedWriteRole
                        ))
                        //or the user fulfills the permission requirements
                        .buildAdd(AuthenticationConditionFactory.userHasCorrectPermission(
                                user1 -> getEventPermission(user1, object), Permission.delete
                        ))
        );
    }
}
