package memo.api;

import memo.util.SendMail;
import org.apache.log4j.Logger;

import javax.mail.MessagingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "EmailServlet", value = "/api/email")
public class EmailServlet extends HttpServlet {


    protected Logger logger = Logger.getLogger(EmailServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            SendMail.getInstance().send(
                    "nils.poecking@hotmail.de",
                    "Hallo Lennart!",
                    "Mails verschicken scheint zu funktionieren. Sag mal bitte was bei Ümlauten passiert :D"
            );
        } catch (MessagingException e) {
            //todo
        }
    }
}
