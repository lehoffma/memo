package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.EventRepository;
import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.ShopItem;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.Collections;
import java.util.function.Function;

import static memo.auth.api.AuthenticationPredicateFactory.userFulfillsMinimumRole;
import static memo.auth.api.AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem;

public class ParticipatedEventsAuthStrategy implements AuthenticationStrategy<ShopItem> {
    @Override
    public boolean isAllowedToRead(User user, ShopItem object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be logged in
                //either the user is looking at his own participated events
                AuthenticationConditionFactory.<ShopItem>userIsLoggedIn()
                        .and((u, item) -> EventRepository.getInstance().findByParticipant(u.getId()).stream()
                                .anyMatch(shopItem -> shopItem.getId().equals(item.getId()))),
                //or he is at least a member of the club and is allowed to view the event
                AuthenticationConditionFactory.<ShopItem>userIsLoggedIn()
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Mitglied))
                        .and(AuthenticationConditionFactory.userFulfillsMinimumRoleOfItem(
                                Function.identity(), ShopItem::getExpectedReadRole
                        ))
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<ShopItem> root, User user) {
        Predicate userIsLookingAtTheirOwnEvents =
                PredicateFactory.combineByOr(
                        builder,
                        EventRepository.getInstance().getByParticipant(builder, root,
                                Collections.singletonList(user.getId().toString())
                        )
                );

        Predicate isAtLeastMember = userFulfillsMinimumRole(builder, user, ClubRole.Mitglied);
        Predicate userFulfillsMinimumRoleOfItem = userFulfillsMinimumRoleOfItem(builder, user, root, "expectedReadRole");

        Predicate userIsAuthorized = builder.and(
                isAtLeastMember,
                userFulfillsMinimumRoleOfItem
        );


        return builder.or(
                userIsLookingAtTheirOwnEvents,
                userIsAuthorized
        );
    }

    @Override
    public boolean isAllowedToCreate(User user, ShopItem object) {
        //dummy since the servlet only implements GET anyway
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, ShopItem object) {
        //dummy since the servlet only implements GET anyway
        return true;
    }

    @Override
    public boolean isAllowedToDelete(User user, ShopItem object) {
        //dummy since the servlet only implements GET anyway
        return true;
    }
}
