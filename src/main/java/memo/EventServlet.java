package memo;


import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.*;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;

/**
 * Servlet implementation class EventServlet
 */
// Tested

@WebServlet(name = "EventServlet", value = "/api/event")
public class EventServlet extends HttpServlet {




    public EventServlet() {
        super();
    }

    //todo as enum
    static Integer getType(String sType) {
        switch (sType) {
            case "tours":
                return 1;

            case "partys":
                return 2;

            case "merch":
                return 3;

            default:
                return 0;

        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");
        String searchTerm = request.getParameter("searchTerm");
        String sType = request.getParameter("type");
        String userId = request.getParameter("userId");


        List<Event> events = getEventsFromDatabase(Sid, searchTerm, sType, userId, response);

        /*
        if (events.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }
        */


        Gson gson = new GsonBuilder().serializeNulls().create();

        //todo sowas ähnliches in den anderen servlets auch machen
        JsonObject responseJson = new JsonObject();
        responseJson.add("events", gson.toJsonTree(events));
        response.getWriter().append(responseJson.toString());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jEvent = getJsonEvent(request, response);

        //ToDo: Duplicate Events

        Event e = createEventFromJson(jEvent);

        List<Color> colorList = new ArrayList<>();
        List<Size> sizeList = new ArrayList<>();

        if (e.getType() == 3) fillSizesFromJson(jEvent, colorList, sizeList, e);

        saveEventToDatabase(e, colorList, sizeList);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");


    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jEvent = getJsonEvent(request, response);

        Integer jId = jEvent.get("id").getAsInt();

        Event e = DatabaseManager.createEntityManager().find(Event.class, jId);

        if (e == null) {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }

        e = updateEventFromJson(jEvent, e);
        e.setId(jEvent.get("id").getAsInt());
        List<Color> colorList = new ArrayList<>();
        List<Size> sizeList = new ArrayList<>();

        if (e.getType() == 3) fillSizesFromJson(jEvent, colorList, sizeList, e);

        //todo lel
        updateEventAtDatabase(e, colorList, sizeList);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");
        Event e = getEventByID(Sid, response);

        if (e == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeEventFromDatabase(e);


    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private JsonObject getJsonEvent(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("event");
    }

    public Event getEventByID(String Sid, HttpServletResponse response) throws IOException {

        try {
            Integer id = Integer.parseInt(Sid);
            return DatabaseManager.createEntityManager().find(Event.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private Event createEventFromJson(JsonObject jEvent) {
        return updateEventFromJson(jEvent, new Event());
    }

    private Event updateEventFromJson(JsonObject jEvent, Event e) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

        e = gson.fromJson(jEvent, Event.class);

        e.setPriceMember(e.getPrice());

        if (jEvent.has("date")) {
            TemporalAccessor day = DateTimeFormatter.ISO_DATE_TIME.parse(jEvent.get("date").getAsString());
            LocalDateTime date = LocalDateTime.from(day);
            e.setDate(date);
        }


        if (jEvent.has("stock")) {
            e.setType(3);
        } else {
            if (e.getVehicle() == null) e.setType(2);
            else e.setType(1);

        }

        return e;
    }

    private void removeEventFromDatabase(Event e) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        e = DatabaseManager.createEntityManager().merge(e);
        DatabaseManager.createEntityManager().remove(e);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private void fillSizesFromJson(JsonObject jEvent, List<Color> colorList, List<Size> sizeList, Event e) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        JsonArray stock = jEvent.getAsJsonArray("stock");

        for (int i = 0; i < stock.size(); ++i) {
            JsonObject st = stock.get(i).getAsJsonObject();
            JsonObject color = st.get("color").getAsJsonObject();
            Color c = gson.fromJson(color, Color.class);
            Size s = new Size();
            s.setColor(c);
            s.setEvent(e);
            s.setSize(st.get("size").getAsString());
            s.setAmount(st.get("amount").getAsInt());
            colorList.add(c);
            sizeList.add(s);
        }


    }

    private void saveEventToDatabase(Event newEvent, List<Color> colorList, List<Size> sizeList) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();

        for (Color i : colorList) {
            em.persist(i);
        }
        for (Size i : sizeList) {
            em.persist(i);
        }
        em.persist(newEvent);

        em.getTransaction().commit();
    }

    private List<Event> getEventsFromDatabase(String Sid, String searchTerm, String sType, String userId,
                                              HttpServletResponse response) throws IOException {

        List<Event> events = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            Event e = getEventByID(Sid, response);
            if (e != null) {
                events.add(e);
                return events;
            }
        }

        if (isStringNotEmpty(searchTerm)) return getEventsBySearchTerm(searchTerm);

        if (isStringNotEmpty(sType)) return getEventsByType(getType(sType));

        if(isStringNotEmpty(userId)) return this.getEventsCreatedByUser(new Integer(userId));

        return getEvents();
    }

    private List<Event> getEventsBySearchTerm(String searchTerm) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Event e " +
                " WHERE UPPER(e.title) LIKE UPPER(:searchTerm) OR UPPER(e.description) LIKE UPPER(:searchTerm)", Event.class)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    private List<Event> getEventsByType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Event e " +
                " WHERE e.type = :type", Event.class)
                .setParameter("type", type)
                .getResultList();
    }

    private List<Event> getEventsCreatedByUser(Integer userId){
        //todo implement
        return new ArrayList<>();
    }

    private List<Event> getEvents() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Event e", Event.class).getResultList();
    }

    private void updateEventAtDatabase(Event e, List<Color> colorList, List<Size> sizeList) {
        EntityManager em = DatabaseManager.createEntityManager();


        em.getTransaction().begin();
        em.merge(e);
        em.getTransaction().commit();
    }
}
