package memo.communication;

import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.communication.model.*;
import memo.data.AbstractPagingAndSortingRepository;
import memo.data.util.PredicateFactory;
import memo.data.util.PredicateSupplierMap;
import memo.util.DatabaseManager;
import memo.util.model.Filter;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Event;
import javax.inject.Inject;
import javax.inject.Named;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class NotificationRepository extends AbstractPagingAndSortingRepository<Notification> {
    private Event<Notification> notificationEvent;

    public NotificationRepository() {
        super(Notification.class, new ConfigurableAuthStrategy<>(true));
    }

    @Inject
    public NotificationRepository(Event<Notification> notificationEvent) {
        super(Notification.class, new ConfigurableAuthStrategy<>(true));
        this.notificationEvent = notificationEvent;
    }


    public void save(Notification notification) {
        List<NotificationUnsubscription> unsubs = this.getUnsubscriptionsOfUser(notification.getUser().getId());
        boolean isUnsubbed = unsubs.stream()
                .anyMatch(unsub -> unsub.getNotificationType().equals(notification.getNotificationType()));

        if (isUnsubbed) {
            notification.setStatus(NotificationStatus.HIDDEN);
        }

        DatabaseManager.getInstance().save(notification, Notification.class);
        this.notificationEvent.fire(notification);
    }

    public List<NotificationUnsubscription> getUnsubscriptionsOfUser(Integer userId) {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT n FROM NotificationUnsubscription n " +
                                "WHERE n.user.id = :userId",
                        NotificationUnsubscription.class)
                .setParameter("userId", userId)
                .getResultList();
    }


    public List<NotificationUnsubscription> getUnsubscriptions(Integer userId, NotificationType notificationType) {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT n FROM NotificationUnsubscription n " +
                                "WHERE n.user.id = :userId AND n.notificationType = :notificationType",
                        NotificationUnsubscription.class)
                .setParameter("userId", userId)
                .setParameter("notificationType", notificationType)
                .getResultList();
    }

    public Optional<NotificationTemplate> getTemplateByType(NotificationType notificationType) {
        return Optional.ofNullable(notificationType)
                .map(_id -> DatabaseManager.getInstance().getById(NotificationTemplate.class, _id));
    }

    public Optional<EmailTemplate> getEmailTemplateByType(NotificationType notificationType) {
        return Optional.ofNullable(notificationType)
                .map(_id -> DatabaseManager.getInstance().getById(EmailTemplate.class, _id));
    }


    public Integer getUnreadMessages(String userId) {
        return this.getMessagesByStatus(userId, NotificationStatus.UNREAD);
    }

    private List<NotificationType> getWebUnsubscriptions(Integer userId) {
        List<NotificationUnsubscription> unsubscriptions = this.getUnsubscriptionsOfUser(userId);
        return unsubscriptions.stream()
                .filter(it -> it.getBroadcasterType().equals(BroadcasterType.NOTIFICATION))
                .map(NotificationUnsubscription::getNotificationType)
                .collect(Collectors.toList());
    }

    private String getUnsubCheck(Integer userId) {
        List<NotificationType> unsubs = this.getWebUnsubscriptions(userId);
        return unsubs.isEmpty()
                ? ""
                : (
                " AND n.notificationType NOT IN ("
                        + unsubs.stream()
                        .map(NotificationType::getValue)
                        .map(Object::toString)
                        .collect(Collectors.joining(","))
                        + ")"
        );
    }

    public Integer getMessagesByStatus(String userId, NotificationStatus status) {
        Integer id = Integer.valueOf(userId);
        String unsubCheck = this.getUnsubCheck(id);

        return ((Long) DatabaseManager.createEntityManager()
                .createNativeQuery("SELECT COUNT(*) FROM notifications n, notification_templates template " +
                        "WHERE n.NOTIFICATIONTYPE = template.NOTIFICATION_TEMPLATE_ID AND n.USER_ID = ?1 " +
                        "AND n.STATUS = ?2 " + unsubCheck)
                .setParameter(1, Integer.valueOf(userId))
                .setParameter(2, status.ordinal())
                .getSingleResult()).intValue();
    }

    public Integer getTotalMessages(String userId) {
        Integer id = Integer.valueOf(userId);
        String unsubCheck = this.getUnsubCheck(id);

        //todo returns the wrong value
        return ((Long) DatabaseManager.createEntityManager()
                .createNativeQuery("SELECT COUNT(*) FROM notifications n, notification_templates template " +
                        "WHERE n.NOTIFICATIONTYPE = template.NOTIFICATION_TEMPLATE_ID AND n.USER_ID = ?1 " +
                        "AND n.STATUS NOT IN (2,3) " + unsubCheck)
                .setParameter(1, Integer.valueOf(userId))
                .getSingleResult()).intValue();
    }

    public List<Notification> getWebNotificationsByUserId(String userId, Integer limit, Integer offset) {
        Integer id = Integer.valueOf(userId);
        //todo should ignored notification types still be fetched, if they were not ignored before?
        //  - no (at the moment)
        List<NotificationType> unsubs = this.getWebUnsubscriptions(id);

        TypedQuery<Notification> query = DatabaseManager.createEntityManager()
                .createQuery("SELECT n FROM Notification n, NotificationTemplate template " +
                        "WHERE n.notificationType = template.notificationType AND " +
                        "   n.user.id = :userId AND n.status NOT IN :status "
                        + (unsubs.isEmpty() ? "" : "AND n.notificationType NOT IN :blocked") +
                        " ORDER BY n.timestamp DESC", Notification.class)
                .setParameter("userId", id)
                .setParameter("status", Arrays.asList(NotificationStatus.DELETED, NotificationStatus.HIDDEN))
                .setMaxResults(limit)
                .setFirstResult(offset);

        if (!unsubs.isEmpty()) {
            query = query.setParameter("blocked", unsubs);
        }
        return query.getResultList();
    }

    @Override
    public List<Predicate> fromFilter(CriteriaBuilder builder, Root<Notification> root, Filter.FilterRequest filterRequest) {
        return PredicateFactory.fromFilter(builder, root, filterRequest,
                new PredicateSupplierMap<>()
        );
    }

    @Override
    public List<Notification> getAll() {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT n FROM Notification n", Notification.class)
                .getResultList();
    }
}
