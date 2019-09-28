package memo.communication.broadcasters;

import memo.communication.DataParser;
import memo.communication.NotificationRepository;
import memo.communication.ReplacementFactory;
import memo.communication.model.EmailTemplate;
import memo.communication.model.Notification;
import memo.model.User;
import memo.util.Configuration;
import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.mail.Message;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Properties;

@Named
@ApplicationScoped
public class MailBroadcaster extends BaseMessageBroadcaster {
    private NotificationRepository notificationRepository;

    private String host;
    private String user;
    private String userName;
    private String password;
    private String port;

    protected Logger logger = LogManager.getLogger(MailBroadcaster.class);

    public MailBroadcaster() {
        this.init();
    }

    @Inject
    public MailBroadcaster(DataParser parser,
                           ReplacementFactory replacementFactory,
                           NotificationRepository notificationRepository) {
        this.init();
        this.dataParser = parser;
        this.replacementFactory = replacementFactory;
        this.notificationRepository = notificationRepository;
    }

    private void init() {
        this.host = Configuration.get("EMAIL_HOST");
        this.user = Configuration.get("EMAIL_USER");
        this.userName = Configuration.get("EMAIL_USER_NAME");
        this.password = Configuration.get("EMAIL_PASSWORD");
        this.port = Configuration.get("EMAIL_PORT");
    }

    /**
     * @param priority
     * @param to
     * @param subject
     * @param text
     */
    private void logEmail(Level priority, String to, String subject, String text) {
        logger.log(priority, "recipient: " + to);
        logger.log(priority, "subject: " + subject);
    }


    @Override
    public String getText(Notification notification) {
        return notificationRepository.getEmailTemplateByType(notification.getNotificationType())
                .map(EmailTemplate::getFilePath)
                .map(this::getEmailText)
                .map(emailText -> this.getText(notification, emailText))
                .orElseThrow(NotFoundException::new);
    }


    private String getEmailText(String fileName) {
        String path = "mails/" + fileName + ".html";
        try (InputStream resource = MailBroadcaster.class.getClassLoader().getResourceAsStream(path)) {
            return IOUtils.toString(resource, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Could not read email template of type " + fileName, e);
            return null;
        }
    }


    private boolean send(String recipient, String subject, String content) {
        //Get the session object
        Properties props = new Properties();
        props.put("mail.smtp.host", getHost());
        props.put("mail.smtp.auth", "true");

        Session session = Session.getDefaultInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(getUser(), getPassword());
                    }
                });

        //Compose the message
        try {

            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(getUser(), getUserName()));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
            message.setSubject(subject);
            message.setContent(content, "text/html; charset=UTF-8");

            //send the message
            Transport.send(message);

            logger.trace("Message sent successfully");
            return true;
        } catch (Exception e) {
            if (e instanceof UnsupportedEncodingException) {
                logger.error("Encoding the charset failed, the Email was not sent.", e);
                this.logEmail(Level.ERROR, recipient, subject, content);
            } else if (e instanceof AddressException) {
                logger.error("Could not parse the recipient's email address. ", e);
                this.logEmail(Level.ERROR, recipient, subject, content);
            } else {
                logger.error("Something went wrong when trying to send an email from ", e);
                this.logEmail(Level.ERROR, recipient, subject, content);
            }
        }
        return false;
    }

    @Override
    public boolean send(Notification notification) {
        Optional<EmailTemplate> emailTemplate = notificationRepository
                .getEmailTemplateByType(notification.getNotificationType());

        if (!emailTemplate.isPresent()) {
            logger.error("Could not send email - template is null");
            return false;
        }

        User recipient = notification.getUser();
        if (recipient == null) {
            logger.error("Could not send email - no user specified");
            return false;
        }

        String content = this.getText(notification);
        return this.send(recipient.getEmail(), emailTemplate.get().getSubject(), content);
    }

    public String getHost() {
        return host;
    }

    public String getUser() {
        return user;
    }


    public String getUserName() {
        return userName;
    }

    public String getPassword() {
        return password;
    }


    public String getPort() {
        return port;
    }
}
