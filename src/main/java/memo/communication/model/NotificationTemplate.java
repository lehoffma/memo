package memo.communication.model;


import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "NOTIFICATION_TEMPLATES")
public class NotificationTemplate {
    @Id
    @Column(name = "NOTIFICATION_TEMPLATE_ID")
    private NotificationType notificationType;

    private String template;

    private String link;

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public NotificationTemplate setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
        return this;
    }

    public String getTemplate() {
        return template;
    }

    public NotificationTemplate setTemplate(String template) {
        this.template = template;
        return this;
    }

    public String getLink() {
        return link;
    }

    public NotificationTemplate setLink(String link) {
        this.link = link;
        return this;
    }
}
