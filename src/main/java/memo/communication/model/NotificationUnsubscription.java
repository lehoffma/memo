package memo.communication.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.model.User;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;

@Entity
@Table(name = "NOTIFICATION_UNSUBSCRIPTIONS", indexes = {@Index(columnList = "user_id", name = "unsubscription_user")})
public class NotificationUnsubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    @JsonDeserialize(using = UserIdDeserializer.class)
    @JsonSerialize(using = UserIdSerializer.class)
    private User user;

    private NotificationType notificationType;

    private BroadcasterType broadcasterType;


    public Integer getId() {
        return id;
    }

    public NotificationUnsubscription setId(Integer id) {
        this.id = id;
        return this;
    }

    public User getUser() {
        return user;
    }

    public NotificationUnsubscription setUser(User user) {
        this.user = user;
        return this;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public NotificationUnsubscription setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
        return this;
    }

    public BroadcasterType getBroadcasterType() {
        return broadcasterType;
    }

    public NotificationUnsubscription setBroadcasterType(BroadcasterType broadcasterType) {
        this.broadcasterType = broadcasterType;
        return this;
    }
}
