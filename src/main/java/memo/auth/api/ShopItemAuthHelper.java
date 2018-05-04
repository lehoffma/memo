package memo.auth.api;

import memo.data.util.PredicateFactory;
import memo.model.Permission;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.model.EventType;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Optional;

import static memo.auth.api.AuthenticationPredicateFactory.userHasCorrectPermissions;

public class ShopItemAuthHelper {
    public static Permission getEventPermission(User user, ShopItem item) {
        return Optional.ofNullable(item)
                .map(ShopItem::getType)
                .flatMap(EventType::findByValue)
                .map(type -> {
                    switch (type) {
                        case merch:
                            return user.getPermissions().getMerch();
                        case tours:
                            return user.getPermissions().getTour();
                        case partys:
                            return user.getPermissions().getParty();
                    }
                    return Permission.none;
                })
                .orElse(Permission.none);
    }

    public static Predicate fulfillsEventTypePermission(CriteriaBuilder builder, Root<ShopItem> root,
                                                        Permission permission,
                                                        User user,
                                                        EventType type) {
        Predicate isEventType = PredicateFactory.get(root, "type")
                .map(eventType -> builder.equal(eventType, type.getValue()))
                .orElse(PredicateFactory.isFalse(builder));

        return builder.and(
                isEventType,
                userHasCorrectPermissions(builder, user, permission, type.getPermissionKey())
        );
    }

    public static Predicate userFulfillsMinimumPermissions(CriteriaBuilder builder, Root<ShopItem> root,
                                                           Permission permission,
                                                           User user) {
        if (user == null) {
            return PredicateFactory.isFalse(builder);
        }

        return builder.or(
                fulfillsEventTypePermission(builder, root, permission, user, EventType.tours),
                fulfillsEventTypePermission(builder, root, permission, user, EventType.partys),
                fulfillsEventTypePermission(builder, root, permission, user, EventType.merch)
        );
    }
}
