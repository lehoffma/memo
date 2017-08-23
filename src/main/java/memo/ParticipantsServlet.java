package memo;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import memo.model.Event;
import memo.model.OrderedItem;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "ParticipantsServlet",value = "/api/participants")
public class ParticipantsServlet extends HttpServlet {


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("type");


        List<OrderedItem> participants = getParticipantsFromDatabase(SeventId,sType,response);

        if (participants.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(participants);

        response.getWriter().append("{ \"participants\": " + output + " }");

    }




    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<OrderedItem> getParticipantsFromDatabase(String SeventId, String sType, HttpServletResponse response) throws IOException {

        if (isStringNotEmpty(SeventId)) { return getParticipantsByEventId(SeventId,response);}

        if (isStringNotEmpty(sType))
        {
            Integer type = EventServlet.getType(sType);
            return getParticipantsByEventType(type);
        }
        return getParticipants();

    }

    private List<OrderedItem> getParticipants() {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o ",OrderedItem.class)
                .getResultList();
    }

    private List<OrderedItem> getParticipantsByEventType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT o FROM OrderedItem o " +
                " WHERE o.event.type = :typ", OrderedItem.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<OrderedItem> getParticipantsByEventId(String SeventId, HttpServletResponse response)throws IOException{
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
