package memo.auth;

import com.google.common.io.CharStreams;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@WebServlet(name = "LogoutServlet", value = "/api/logout")
public class LogoutServlet extends HttpServlet {

    public LogoutServlet() {
        super();

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String body = CharStreams.toString(request.getReader());

        //lel
        //token check
        // logout
    }

}
