package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.ListBuilder;

import javax.persistence.criteria.*;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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
        if (user == null) {
            return PredicateFactory.get(root, "expectedReadRole")
                    .map(role -> builder.equal(role, ClubRole.Gast))
                    .orElse(PredicateFactory.isFalse(builder));
        }

        Optional<Path<List<Integer>>> authors = PredicateFactory.get(root, "author", "id");
        Optional<Path<ClubRole>> expectedReadRole = PredicateFactory.get(root, "expectedReadRole");
        Optional<Path<Integer>> type = PredicateFactory.get(root, "type");

        Expression<Boolean> permissionCheck = builder.<Boolean>selectCase()
                .when(
                        type.map(it -> builder.equal(it, 1)).orElse(PredicateFactory.isFalse(builder)),
                        user.getPermissions().getTour().toValue() >= Permission.read.ordinal()
                )
                .when(
                        type.map(it -> builder.equal(it, 2)).orElse(PredicateFactory.isFalse(builder)),
                        user.getPermissions().getParty().toValue() >= Permission.read.ordinal()
                )
                .when(
                        type.map(it -> builder.equal(it, 3)).orElse(PredicateFactory.isFalse(builder)),
                        user.getPermissions().getMerch().toValue() >= Permission.read.ordinal()
                )
                .otherwise(false);

        Predicate roleCheck = expectedReadRole
                .map(role -> builder.lessThanOrEqualTo(role, user.getClubRole()))
                .orElse(PredicateFactory.isFalse(builder));

        Predicate authorCheck = authors
                .map(it -> builder.isMember(user.getId(), it))
                .orElse(PredicateFactory.isFalse(builder));

        return builder.or(
                builder.isTrue(permissionCheck),
                roleCheck,
                authorCheck
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
