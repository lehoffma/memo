package memo.api;

import memo.auth.api.ParticipatedEventsAuthStrategy;
import memo.data.EventRepository;
import memo.model.ShopItem;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "ParticipatedEventsServlet", value = "/api/participatedEvents")
public class ParticipatedEventsServlet extends AbstractApiServlet<ShopItem> {
    public ParticipatedEventsServlet() {
        super(new ParticipatedEventsAuthStrategy());
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> EventRepository.getInstance().getEventsByUser(Integer.valueOf(
                        getParameter(paramMap, "userId")
                )),
                "shopItems"
        );
    }
}