package memo.util;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.Priority;

import javax.mail.*;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.Properties;


public class SendMail {

    protected Logger logger = Logger.getLogger(SendMail.class);

    private static SendMail instance;

    public static SendMail getInstance() {
        if (instance == null) instance = new SendMail();
        return instance;
    }

    SendMail() {

        HOST = "smtp.strato.de";
        USER = "shop@meilenwoelfe.de";
        USER_NAME = "Meilenshop";
        PASSWORD = "Wh2k15nb,e!";
        PORT = "465";
    }

    private String HOST;
    private String USER;
    private String USER_NAME;
    private String PASSWORD;
    private String PORT;

    private void logEmail(Priority priority, String to, String subject, String text) {
        logger.log(priority, "recipient: " + to);
        logger.log(priority, "subject: " + subject);
        logger.log(priority, "email text: " + text);
    }

    public void send(String to, String subject, String text) throws UnsupportedEncodingException, MessagingException {

        //Get the session object
        Properties props = new Properties();
        props.put("mail.smtp.host", HOST);
        props.put("mail.smtp.auth", "true");
        //props.put("mail.smtp.user", USER);
        //props.put("mail.smtp.port", PORT);

        Session session = Session.getDefaultInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(USER, PASSWORD);
                    }
                });

        //Compose the message
        try {

            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(USER, USER_NAME));
            message.addRecipient(Message.RecipientType.TO, new InternetAddress(to));
            message.setSubject(subject);
            message.setContent(text,"text/html");

            //send the message
            Transport.send(message);

            logger.trace("Message sent successfully");
        } catch (Exception e) {
            if (e instanceof UnsupportedEncodingException) {
                logger.error("Encoding the charset failed, the Email was not sent.", e);
                this.logEmail(Level.ERROR, to, subject, text);
                throw e;
            } else if (e instanceof AddressException) {
                logger.error("Could not parse the recipient's email address. ", e);
                this.logEmail(Level.ERROR, to, subject, text);
                throw e;
            } else {
                logger.error("Something went wrong when trying to send an email from ", e);
                this.logEmail(Level.ERROR, to, subject, text);
                throw e;
            }
        }
    }
}