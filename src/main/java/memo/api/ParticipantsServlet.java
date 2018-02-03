package memo.api;

import com.fasterxml.jackson.databind.node.ObjectNode;
import memo.data.EventRepository;
import memo.data.ParticipantRepository;
import memo.model.OrderedItem;
import memo.model.ShopItem;
import memo.util.ApiUtils;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "ParticipantsServlet", value = "/api/participants")
public class ParticipantsServlet extends HttpServlet {

    private static final Logger logger = Logger.getLogger(ParticipantsServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String eventId = request.getParameter("eventId");
        String type = request.getParameter("type");
        String userId = request.getParameter("userId");

        logger.trace("GET called");

        List<OrderedItem> result = ParticipantRepository.getInstance().get(eventId, type, response);

        if (ApiUtils.stringIsNotEmpty(userId)) {
            logger.trace("Returning list of events the user participated in");
            List<ShopItem> shopItems = EventRepository.getInstance().getEventsByUser(Integer.valueOf(userId));

            ObjectNode jsonShopItems = ApiUtils.getInstance().toObjectNode(shopItems, "shopItems");
            response.getWriter().append(jsonShopItems.toString());
            return;
        }

        logger.trace("Returning list of participants");
        ObjectNode jsonParticipants = ApiUtils.getInstance().toObjectNode(result, "participants");
        response.getWriter().append(jsonParticipants.toString());
    }


}
