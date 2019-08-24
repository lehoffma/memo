package memo.communication.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "email_notification")
public class EmailTemplate {
    @Id
    @Column(name = "EMAIL_TEMPLATE_ID")
    private NotificationType notificationType;

    private String filePath;

    private String subject;

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public EmailTemplate setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
        return this;
    }

    public String getFilePath() {
        return filePath;
    }

    public EmailTemplate setFilePath(String template) {
        this.filePath = template;
        return this;
    }

    public String getSubject() {
        return subject;
    }

    public EmailTemplate setSubject(String subject) {
        this.subject = subject;
        return this;
    }
}
