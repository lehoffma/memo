package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.communication.model.NotificationUnsubscription;
import memo.model.ClubRole;
import memo.model.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.userIsLoggedIn;

@Named
@ApplicationScoped
public class NotificationUnsubscriptionAuthStrategy implements AuthenticationStrategy<NotificationUnsubscription> {
    @Override
    public boolean isAllowedToRead(User user, NotificationUnsubscription object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //admin is viewing notification settings
                AuthenticationConditionFactory.<NotificationUnsubscription>userFulfillsMinimumRole(() -> ClubRole.Admin)
                        .and(userIsLoggedIn()),
                //user is viewing his own notification settings
                AuthenticationConditionFactory.userIsAuthor(NotificationUnsubscription::getUser)
        ));
    }

    @Override
    public boolean isAllowedToCreate(User user, NotificationUnsubscription object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //admin is editing notification settings
                AuthenticationConditionFactory.<NotificationUnsubscription>userFulfillsMinimumRole(() -> ClubRole.Admin)
                        .and(userIsLoggedIn()),
                //user is editing his own notification settings
                AuthenticationConditionFactory.userIsAuthor(NotificationUnsubscription::getUser)
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, NotificationUnsubscription object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //admin is editing notification settings
                AuthenticationConditionFactory.<NotificationUnsubscription>userFulfillsMinimumRole(() -> ClubRole.Admin)
                        .and(userIsLoggedIn()),
                //user is editing his own notification settings
                AuthenticationConditionFactory.userIsAuthor(NotificationUnsubscription::getUser)
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, NotificationUnsubscription object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //admin is deleting notification settings
                AuthenticationConditionFactory.<NotificationUnsubscription>userFulfillsMinimumRole(() -> ClubRole.Admin)
                        .and(userIsLoggedIn()),
                //user is editing his own notification settings
                AuthenticationConditionFactory.userIsAuthor(NotificationUnsubscription::getUser)
        ));
    }
}
