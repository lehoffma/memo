package memo.util;

import org.apache.log4j.Logger;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;


public class SendMail {

    protected Logger logger = Logger.getLogger(SendMail.class);

    private static SendMail instance;

    public static SendMail getInstance() {
        if (instance == null) instance = new SendMail();
        return instance;
    }

    SendMail(){

        HOST ="smtp.strato.de";
        USER ="shop@meilenwoelfe.de";
        USER_NAME = "Meilenshop";
        PASSWORD ="Wh2k15nb,e!";
        PORT = "465";
    }

    private String HOST;
    private String USER;
    private String USER_NAME;
    private String PASSWORD;
    private String PORT;

    public void send(String to, String subject, String text) {

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
            message.addRecipient(Message.RecipientType.TO,new InternetAddress(to));
            message.setSubject(subject);
            message.setText(text);

            //send the message
//            Transport.send(message);

            logger.trace("message sent successfully");

        } catch (Exception e) {e.printStackTrace();}
    }
}