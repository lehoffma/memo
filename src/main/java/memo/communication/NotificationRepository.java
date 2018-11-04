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
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.List;
import java.util.Optional;

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
        DatabaseManager.getInstance().save(notification, Notification.class);
        this.notificationEvent.fire(notification);
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

    public Integer getMessagesByStatus(String userId, NotificationStatus status) {
        return ((Long) DatabaseManager.createEntityManager()
                .createNativeQuery("SELECT COUNT(*) FROM notifications n " +
                        "WHERE n.USER_ID = ?1 AND n.STATUS = ?2")
                .setParameter(1, Integer.valueOf(userId))
                .setParameter(2, status.ordinal())
                .getSingleResult()).intValue();
    }

    public List<Notification> getByUserId(String userId, Integer limit) {
        return getByUserId(userId, limit, 0);
    }

    public Integer getTotalMessages(String userId) {
        return ((Long) DatabaseManager.createEntityManager()
                .createNativeQuery("SELECT COUNT(*) FROM notifications n " +
                        "WHERE n.USER_ID = ?1 AND n.STATUS <> 2")
                .setParameter(1, Integer.valueOf(userId))
                .getSingleResult()).intValue();
    }

    public List<Notification> getByUserId(String userId, Integer limit, Integer offset) {
        return DatabaseManager.createEntityManager()
                .createQuery("SELECT n FROM Notification n " +
                                "WHERE n.user.id = :userId AND n.status <> :status  ORDER BY n.timestamp DESC",
                        Notification.class)
                .setParameter("userId", Integer.valueOf(userId))
                .setParameter("status", NotificationStatus.DELETED)
                .setMaxResults(limit)
                .setFirstResult(offset)
                .getResultList();
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
