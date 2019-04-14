package memo.communication.mail;

import memo.communication.MessageTransmitter;
import memo.communication.MessageType;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.Configuration;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.Priority;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import java.util.Properties;


public class MailTransmitter implements MessageTransmitter {
    protected Logger logger = Logger.getLogger(MailTransmitter.class);

    public MailTransmitter() {
        this.host = Configuration.get("EMAIL_HOST");
        this.user = Configuration.get("EMAIL_USER");
        this.userName = Configuration.get("EMAIL_USER_NAME");
        this.password = Configuration.get("EMAIL_PASSWORD");
        this.port = Configuration.get("EMAIL_PORT");
    }

    private final String host;
    private final String user;
    private final String userName;
    private final String password;
    private final String port;

    /**
     * @param priority
     * @param to
     * @param subject
     * @param text
     */
    private void logEmail(Priority priority, String to, String subject, String text) {
        logger.log(priority, "recipient: " + to);
        logger.log(priority, "subject: " + subject);
        logger.log(priority, "email text: " + text);
    }


    public void send(User to, String subject, String content) throws UnsupportedEncodingException, MessagingException {
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
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(to.getEmail()));
            message.setSubject(subject);
            message.setContent(content, "text/html; charset=UTF-8");

            //send the message
            Transport.send(message);

            logger.trace("Message sent successfully");
        } catch (Exception e) {
            if (e instanceof UnsupportedEncodingException) {
                logger.error("Encoding the charset failed, the Email was not sent.", e);
                this.logEmail(Level.ERROR, to.getEmail(), subject, content);
                throw e;
            } else if (e instanceof AddressException) {
                logger.error("Could not parse the recipient's email address. ", e);
                this.logEmail(Level.ERROR, to.getEmail(), subject, content);
                throw e;
            } else {
                logger.error("Something went wrong when trying to send an email from ", e);
                this.logEmail(Level.ERROR, to.getEmail(), subject, content);
                throw e;
            }
        }
    }

    @Override
    public String getContent(User recipient, List<ShopItem> items, MessageType type, Map<String, Object> options) {
        String rawText = MailLoader.loadAsText(type);
        Map<String, String> placeHolderReplacement = MailPlaceholderFactory.getPlaceHolderReplacement(type, recipient, items, options);
        return MailLoader.replacePlaceholders(rawText, placeHolderReplacement);
    }

    @Override
    public String getContent(User recipient, ShopItem item, MessageType type, Map<String, Object> options) {
        String rawText = MailLoader.loadAsText(type);
        Map<String, String> placeHolderReplacement = MailPlaceholderFactory.getPlaceHolderReplacement(type, recipient, item, options);
        return MailLoader.replacePlaceholders(rawText, placeHolderReplacement);
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