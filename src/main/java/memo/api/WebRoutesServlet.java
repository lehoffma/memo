package memo.api;

import org.apache.log4j.Logger;

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
                "/my-events",
                "/order-history",
                "/not-allowed",

                "/tours/*",
                "/partys/*",
                "/merch/*",
                "/members/*",
                "/entries/*",

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

                "/cart",
                "/checkout",
                "/order-complete",
                "/address"
        }
)
public class WebRoutesServlet extends HttpServlet {
    private final static Logger logger = Logger.getLogger(WebRoutesServlet.class);

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
