package memo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import memo.model.Event;
import memo.model.OrderedItem;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;
import java.util.stream.Collectors;

@WebServlet(name = "ParticipantsServlet", value = "/api/participants")
public class ParticipantsServlet extends HttpServlet {


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("type");
        String userId = request.getParameter("userId");


        List<OrderedItem> result = getParticipantsFromDatabase(SeventId, sType, response);

        //todo wohin soll der getUserEvents call?
        if(isStringNotEmpty(userId)){
            List<Event> events = this.getEventsByUserId(Integer.valueOf(userId));
            Gson gson = new GsonBuilder().serializeNulls().create();
            JsonObject responseJson = new JsonObject();
            Type eventType = new TypeToken<List<Event>>() {}.getType();
            responseJson.add("events", gson.toJsonTree(events, eventType));
            response.getWriter().append(responseJson.toString());
            return;
        }

        /*
        if (result.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }
*/

        Gson gson = new GsonBuilder().serializeNulls().create();
        JsonObject responseJson = new JsonObject();
        responseJson.add("participants", gson.toJsonTree(result));
        response.getWriter().append(responseJson.toString());
    }


    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<OrderedItem> getParticipantsFromDatabase(String SeventId, String sType, HttpServletResponse response) throws IOException {

        if (isStringNotEmpty(SeventId)) {
            return getParticipantsByEventId(SeventId, response);
        }

        if (isStringNotEmpty(sType)) {
            Integer type = EventServlet.getType(sType);
            return getParticipantsByEventType(type);
        }
        return getParticipants();

    }

    private List<OrderedItem> getParticipants() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o ", OrderedItem.class)
                .getResultList();
    }

    private List<OrderedItem> getParticipantsByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                " WHERE o.event.type = :typ", OrderedItem.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<Event> getEventsByUserId(Integer userId){
        return DatabaseManager.createEntityManager().createQuery(
                "SELECT item from Order o join OrderedItem item \n" +
                        "    WHERE o.userId =:userId", OrderedItem.class)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .map(OrderedItem::getEvent)
                .distinct()
                .collect(Collectors.toList());
    }

    private List<OrderedItem> getParticipantsByEventId(String SeventId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(SeventId);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                    " WHERE o.event.id = :id", OrderedItem.class)
                    .setParameter("id", id)
                    .getResultList();
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }


}
