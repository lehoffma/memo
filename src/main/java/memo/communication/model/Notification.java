package memo.communication.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import memo.model.User;
import memo.serialization.UserIdDeserializer;
import memo.serialization.UserIdSerializer;

import javax.persistence.*;
import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    @JsonDeserialize(using = UserIdDeserializer.class)
    @JsonSerialize(using = UserIdSerializer.class)
    private User user;

    @Column(nullable = false)
    private java.sql.Timestamp timestamp = Timestamp.from(Instant.now());

    private NotificationStatus status = NotificationStatus.UNREAD;

    private NotificationType notificationType;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String data = "";


    public Integer getId() {
        return id;
    }

    public Notification setId(Integer id) {
        this.id = id;
        return this;
    }

    public User getUser() {
        return user;
    }

    public Notification setUser(User user) {
        this.user = user;
        return this;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public Notification setStatus(NotificationStatus status) {
        this.status = status;
        return this;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public Notification setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
        return this;
    }

    public String getData() {
        return data;
    }

    public Notification setData(String data) {
        this.data = data;
        return this;
    }


    public Timestamp getTimestamp() {
        return timestamp;
    }

    public Notification setTimestamp(Timestamp timestamp) {
        this.timestamp = timestamp;
        return this;
    }
}
