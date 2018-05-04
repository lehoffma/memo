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
                "/my-events",
                "/order-history",
                "/not-allowed",
                "/confirm-email",
                "/applyForMembership",
                "/requestMembership",

                "/tours/*",
                "/partys/*",
                "/merch/*",
                "/members/*",
                "/entries/*",
                "/orders/*",

                "/search",
                "/shop",
                "/tours",
                "/partys",
                "/merch",
                "/members",

                "/create/*",

                "/calendar",

                "/dashboard",
                "/leaderboard",
                "/management/costs",
                "/management/stock",
                "/management/stock/merch",
                "/management/orders",

                "/cart",
                "/checkout",
                "/order-complete",
                "/address",


                "/impressum",
                "/settings"
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
            logger.error("Could not redirect", e);
        }
    }
}
