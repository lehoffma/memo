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
import java.util.Objects;
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
                        .setTemplate("{Username} hat eine Statusänderung zu {NewClubRole} beantragt!")
                        .setImagePath("{UserProfilePicture}")
                        .setLink("/club/members/{UserId}/edit"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.RESPONSIBLE_USER)
                        .setTemplate("Du wurdest als Verantwortlicher für {ItemName} hinzugefügt!")
                        .setImagePath("{ItemImage}")
                        .setLink("/shop/{ItemType}/{ItemId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.OBJECT_HAS_CHANGED)
                        .setTemplate("{ItemName} wurde verändert.")
                        .setImagePath("{ItemImage}")
                        .setLink("/shop/{ItemType}/{ItemId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.DEBIT_TREASURER)
                        .setTemplate("Leite ein Lastschrift-Verfahren für die eingegangene Bestellung ein!")
                        .setLink("/management/orders/{OrderId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.TRANSFER_TREASURER)
                        .setTemplate("Überprüfe die eingegangene Überweisung!")
                        .setLink("/management/orders/{OrderId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.NEW_COMMENT)
                        .setTemplate("Neuer Kommentar von {Username} unter {ItemName}!")
                        .setImagePath("{UserProfilePicture}")
                        .setLink("/shop/{ItemType}/{ItemId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.MARKED_AS_REPORT_WRITER)
                        .setTemplate("Du wurdest als Berichtverantwortlicher für {ItemName} hinzugefügt!")
                        .setImagePath("{ItemImage}")
                        .setLink("/shop/{ItemType}/{ItemId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.UPCOMING_EVENT)
                        .setTemplate("Bevorstehendes Event: {ItemName} heute um {ItemTime}!")
                        .setImagePath("{ItemImage}")
                        .setLink("/shop/{ItemType}/{ItemId}"),
                new NotificationTemplate()
                        .setNotificationType(NotificationType.CHECK_ON_ORDER)
                        .setTemplate("Einige alte Bestellungen müssen noch geupdated werden!")
                        .setLink("/management/orders?status=0,1,2,3,6,7,8,9&maxTimeStamp={Now}")
        );
        List<NotificationTemplate> currentTemplates = new ArrayList<>(DatabaseManager.createEntityManager()
                .createQuery("SELECT e FROM NotificationTemplate e", NotificationTemplate.class)
                .getResultList());
        List<NotificationTemplate> newTemplates = templates.stream()
                .filter(t -> currentTemplates.stream()
                        .noneMatch(c -> c.getNotificationType().getValue().equals(t.getNotificationType().getValue())))
                .collect(Collectors.toList());
        List<NotificationTemplate> changedTemplates = templates.stream()
                .filter(t -> currentTemplates.stream()
                        .anyMatch(c -> c.getNotificationType().getValue().equals(t.getNotificationType().getValue())
                                && (!Objects.equals(c.getTemplate(), t.getTemplate())
                                || !Objects.equals(c.getLink(), t.getLink())
                                || !Objects.equals(c.getImagePath(), t.getImagePath()))
                        )
                )
                .collect(Collectors.toList());


        if (newTemplates.size() > 0) {
            DatabaseManager.getInstance().saveAll(newTemplates, NotificationTemplate.class);
        }


        if (changedTemplates.size() > 0) {
            DatabaseManager.getInstance().updateAll(changedTemplates, NotificationTemplate.class);
        }

        //todo emails for
        //   - NEW_COMMENT
        //   - MARKED_AS_REPORT_WRITER
        //

        this.updateEmailTemplates();
    }

    private void updateEmailTemplates(){
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
                .filter(t -> currentEmailTemplates.stream()
                        .noneMatch(c -> c.getNotificationType().getValue().equals(t.getNotificationType().getValue())))
                .collect(Collectors.toList());
        List<EmailTemplate> changedEmailTemplates = emailTemplates.stream()
                .filter(t -> currentEmailTemplates.stream()
                        .anyMatch(c -> c.getNotificationType().getValue().equals(t.getNotificationType().getValue())
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
