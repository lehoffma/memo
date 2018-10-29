package memo.communication;

import memo.communication.model.EmailTemplate;
import memo.communication.model.NotificationTemplate;
import memo.communication.model.NotificationType;
import memo.util.DatabaseManager;

import javax.annotation.PostConstruct;
import javax.ejb.Startup;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
@Startup
public class NotificationInitializer {

    @PostConstruct
    public void initialize() {
        List<NotificationTemplate> templates = Arrays.asList(
                new NotificationTemplate()
                        .setNotificationType(NotificationType.CLUBROLE_CHANGE_REQUEST)
                        .setTemplate("<Username> hat eine Statusänderung zu <NewClubRole> beantragt!")
                        .setLink("/members/<UserId>/edit"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.RESPONSIBLE_USER)
                        .setTemplate("Du wurdest als Verantwortlicher für <ItemName> hinzugefügt!")
                        .setLink("/<ItemType>/<ItemId>"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.OBJECT_HAS_CHANGED)
                        .setTemplate("<ItemName> wurde verändert.")
                        .setLink("/<ItemType>/<ItemId>"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.DEBIT_TREASURER)
                        .setTemplate("Leite ein Lastschrift-Verfahren für die eingegangene Bestellung ein!")
                        .setLink("/orders/<OrderId>"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.TRANSFER_TREASURER)
                        .setTemplate("Überprüfe die eingegangene Überweisung!")
                        .setLink("/orders/<OrderId>")
        );
        List<NotificationTemplate> currentTemplates = new ArrayList<>(DatabaseManager.createEntityManager()
                .createQuery("SELECT e FROM NotificationTemplate e", NotificationTemplate.class)
                .getResultList());
        List<NotificationTemplate> newTemplates = templates.stream()
                .filter(t -> currentTemplates.stream().noneMatch(c -> c.getNotificationType().equals(t.getNotificationType())))
                .collect(Collectors.toList());
        List<NotificationTemplate> changedTemplates = templates.stream()
                .filter(t -> currentTemplates.stream()
                        .anyMatch(c -> c.getNotificationType().equals(t.getNotificationType())
                                && (!c.getTemplate().equals(t.getTemplate()) || !c.getLink().equals(t.getLink()))
                        )
                )
                .collect(Collectors.toList());


        if (newTemplates.size() > 0) {
            DatabaseManager.getInstance().saveAll(newTemplates, NotificationTemplate.class);
        }


        if (changedTemplates.size() > 0) {
            DatabaseManager.getInstance().updateAll(changedTemplates, NotificationTemplate.class);
        }

        List<EmailTemplate> emailTemplates = Arrays.asList(
                new EmailTemplate()
                        .setNotificationType(NotificationType.REGISTRATION)
                        .setFilePath("Registration")
                        .setSubject("Registrierung erfolgreich!"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.FORGOT_PASSWORD)
                        .setFilePath("ForgotPassword")
                        .setSubject("Passwort vergessen?"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.CLUBROLE_CHANGE_REQUEST)
                        .setFilePath("StatusChangeRequest")
                        .setSubject("Jemand hat eine Statusänderung beantragt!"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.RESPONSIBLE_USER)
                        .setFilePath("ResponsibleUser")
                        .setSubject("Du wurdest als Verantwortlicher hinzugefügt!"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.OBJECT_HAS_CHANGED)
                        .setFilePath("ObjectHasChanged")
                        .setSubject("Ein Event an dem du teilnimmst wurde geändert!"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.ORDER_CONFIRMATION)
                        .setFilePath("OrderConfirmation")
                        .setSubject("Bestellbestätigung"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.DEBIT_CUSTOMER)
                        .setFilePath("DebitCustomer")
                        .setSubject("Wichtige Informationen zu deiner Bestellung."),
                new EmailTemplate()
                        .setNotificationType(NotificationType.DEBIT_TREASURER)
                        .setFilePath("DebitTreasurer")
                        .setSubject("Leite ein Lastschrift-Verfahren für die eingegangene Bestellung ein!"),
                new EmailTemplate()
                        .setNotificationType(NotificationType.TRANSFER_CUSTOMER)
                        .setFilePath("TransferCustomer")
                        .setSubject("Wichtige Informationen zu deiner Bestellung."),
                new EmailTemplate()
                        .setNotificationType(NotificationType.TRANSFER_TREASURER)
                        .setFilePath("TransferTreasurer")
                        .setSubject("Überprüfe die eingegangene Bestellung!")
        );

        List<EmailTemplate> currentEmailTemplates = new ArrayList<>(DatabaseManager.createEntityManager()
                .createQuery("SELECT e FROM EmailTemplate e", EmailTemplate.class)
                .getResultList());
        List<EmailTemplate> newEmailTemplates = emailTemplates.stream()
                .filter(t -> currentEmailTemplates.stream().noneMatch(c -> c.getNotificationType().equals(t.getNotificationType())))
                .collect(Collectors.toList());
        List<EmailTemplate> changedEmailTemplates = emailTemplates.stream()
                .filter(t -> currentEmailTemplates.stream()
                        .anyMatch(c -> c.getNotificationType().equals(t.getNotificationType())
                                && (!c.getSubject().equals(t.getSubject()) || !c.getFilePath().equals(t.getFilePath()))
                        )
                )
                .collect(Collectors.toList());

        if (newEmailTemplates.size() > 0) {
            DatabaseManager.getInstance().saveAll(newEmailTemplates, EmailTemplate.class);
        }

        if (changedEmailTemplates.size() > 0) {
            DatabaseManager.getInstance().updateAll(changedEmailTemplates, EmailTemplate.class);
        }
    }
}
