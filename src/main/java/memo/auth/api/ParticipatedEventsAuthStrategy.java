package memo.auth.api;

import memo.data.EventRepository;
import memo.model.ClubRole;
import memo.model.ShopItem;
import memo.model.User;

import java.util.Arrays;
import java.util.function.Function;

public class ParticipatedEventsAuthStrategy implements AuthenticationStrategy<ShopItem> {
    @Override
    public boolean isAllowedToRead(User user, ShopItem object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be logged in
                //either the user is looking at his own participated events
                AuthenticationConditionFactory.<ShopItem>userIsLoggedIn()
                        .and((u, item) -> EventRepository.getInstance().getEventsByUser(u.getId()).stream()
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
