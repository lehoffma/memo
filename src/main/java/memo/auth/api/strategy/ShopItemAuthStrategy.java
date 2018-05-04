package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.util.PredicateFactory;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.ListBuilder;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.function.BiPredicate;
import java.util.function.Function;
import java.util.stream.Collectors;

import static memo.auth.api.AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem;
import static memo.auth.api.AuthenticationPredicateFactory.userIsOneOfAuthors;
import static memo.auth.api.ShopItemAuthHelper.getEventPermission;
import static memo.auth.api.ShopItemAuthHelper.userFulfillsMinimumPermissions;

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
                        .buildAdd(
                                AuthenticationConditionFactory
                                        .userFulfillsMinimumRoleOfItem(
                                                Function.identity(),
                                                ShopItem::getExpectedReadRole
                                        )
                                        //and the user fulfills the permission requirements
                                        .and(AuthenticationConditionFactory.userHasCorrectPermission(
                                                user1 -> getEventPermission(user1, object), Permission.read
                                        ))
                        )
        );
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<ShopItem> root, User user) {
        Predicate userIsOneOfAuthors = userIsOneOfAuthors(builder, root, user,
                shopItemRoot -> PredicateFactory.get(shopItemRoot, "author", "id"));

        Predicate userFulfillsMinimumRoleOfItem = userFulfillsMinimumRoleOfItem(builder, user, root,
                shopItemRoot -> shopItemRoot, "expectedReadRole");
        Predicate userFulfillsMinimumPermissions = userFulfillsMinimumPermissions(builder, root, Permission.read, user);

        Predicate userIsAuthorized = builder.and(
                userFulfillsMinimumRoleOfItem,
                userFulfillsMinimumPermissions
        );

        return builder.or(
                userIsOneOfAuthors,
                userIsAuthorized
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
                        .buildAdd(
                                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                        Function.identity(),
                                        ShopItem::getExpectedWriteRole

                                )
                                        //and the user fulfills the permission requirements
                                        .and(AuthenticationConditionFactory.userHasCorrectPermission(
                                                user1 -> getEventPermission(user1, object), Permission.write
                                        ))
                        )
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
                        .buildAdd(
                                AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                        Function.identity(),
                                        ShopItem::getExpectedWriteRole
                                )
                                        //and the user fulfills the permission requirements
                                        .and(AuthenticationConditionFactory.userHasCorrectPermission(
                                                user1 -> getEventPermission(user1, object), Permission.delete
                                        ))
                        )
        );
    }
}
