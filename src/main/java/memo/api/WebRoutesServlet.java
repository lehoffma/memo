package memo.api;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "WebRoutesServlet",
        value = {
                "/login",
                "/signup/*",
                "/forgot-password",
                "/password-reset",
                "/not-allowed",
                "/confirm-email",

                //todo make routes more precise?
                "/shop",
                "/shop/*",
                "/club",
                "/club/*",
                "/management",
                "/management/*",
                "/user",
                "/user/*",

                "/notifications",
                "/membership/*",

                "/cart",
                "/checkout",
                "/order-complete",
                "/address",
        }
)
public class WebRoutesServlet extends HttpServlet {
    private final static Logger logger = LogManager.getLogger(WebRoutesServlet.class);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            RequestDispatcher view = req.getRequestDispatcher("/index.html");
            view.forward(req, resp);
        } catch (IllegalStateException e) {
            logger.error("Could not forward", e);
        }
    }
}
