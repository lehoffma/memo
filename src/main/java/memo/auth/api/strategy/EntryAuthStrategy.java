package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.util.PredicateFactory;
import memo.model.*;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

import static memo.auth.api.AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem;
import static memo.auth.api.AuthenticationPredicateFactory.userHasPermissions;

@Named
@ApplicationScoped
public class EntryAuthStrategy implements AuthenticationStrategy<Entry> {
    @Override
    public boolean isAllowedToRead(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.read))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    public boolean isAllowedToReadState(User user) {
        return userIsAuthorized(user, null, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..and has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.read))
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Entry> root, User user) {
        if (user == null) {
            return PredicateFactory.isTrue(builder);
        }

        Predicate userHasCorrectPermissions = userHasPermissions(builder, user, Permission.read, PermissionState::getFunds);

        Predicate userFulfillsMinimumRoleOfItem = userFulfillsMinimumRoleOfItem(builder, user, root,
                "item", "expectedReadRole");

        return builder.and(
                userHasCorrectPermissions,
                userFulfillsMinimumRoleOfItem
        );
    }

    @Override
    public boolean isAllowedToCreate(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.create))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.write))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Entry object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //the user is logged in..
                AuthenticationConditionFactory.<Entry>userIsLoggedIn()
                        //..has the correct permissions necessary..
                        .and(AuthenticationConditionFactory
                                .userHasCorrectPermission(it -> it.getPermissions().getFunds(), Permission.delete))
                        //..and is allowed to read the associated shopItem..
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Entry::getItem, ShopItem::getExpectedReadRole
                        ))
        ));
    }
}
