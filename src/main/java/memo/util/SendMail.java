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

    SendMail() {}

    private String host;
    private String user;
    private String userName;
    private String password;
    private String port;


    private void logEmail(Priority priority, String to, String subject, String text) {
        logger.log(priority, "recipient: " + to);
        logger.log(priority, "subject: " + subject);
        logger.log(priority, "email text: " + text);
    }

    public void send(String to, String subject, String text) throws UnsupportedEncodingException, MessagingException {

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

    public String getHost() {
        return host;
    }
    public void setHost(String host) {
        this.host = host;
    }
    public String getUser() {
        return user;
    }
    public void setUser(String user) {
        this.user = user;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPort() {
        return port;
    }
    public void setPort(String port) {
        this.port = port;
    }
}