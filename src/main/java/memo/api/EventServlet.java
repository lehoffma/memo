package memo.api;


import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.util.DatabaseManager;
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
        String authorId = request.getParameter("authorId");


        List<ShopItem> shopItems = getEventsFromDatabase(Sid, searchTerm, sType, userId, authorId, response);

        /*
        if (shopItems.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }
        */


        Gson gson = new GsonBuilder().serializeNulls().create();

        //todo sowas ähnliches in den anderen servlets auch machen
        JsonObject responseJson = new JsonObject();
        responseJson.add("shopItems", gson.toJsonTree(shopItems));
        response.getWriter().append(responseJson.toString());
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jEvent = getJsonEvent(request, response);

        //ToDo: Duplicate Events

        ShopItem e = createEventFromJson(jEvent);

        List<Color> colorList = new ArrayList<>();
        List<Stock> stockList = new ArrayList<>();

        if (e.getType() == 3) fillSizesFromJson(jEvent, colorList, stockList, e);

        saveEventToDatabase(e, colorList, stockList);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");


    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jEvent = getJsonEvent(request, response);

        Integer jId = jEvent.get("id").getAsInt();

        ShopItem e = DatabaseManager.createEntityManager().find(ShopItem.class, jId);

        if (e == null) {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }

        e = updateEventFromJson(jEvent, e);
        e.setId(jEvent.get("id").getAsInt());
        List<Color> colorList = new ArrayList<>();
        List<Stock> stockList = new ArrayList<>();

        if (e.getType() == 3) fillSizesFromJson(jEvent, colorList, stockList, e);

        //todo lel
        updateEventAtDatabase(e, colorList, stockList);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");
        ShopItem e = getEventByID(Sid, response);

        if (e == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeEventFromDatabase(e);


    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/util;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private JsonObject getJsonEvent(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("event");
    }

    public ShopItem getEventByID(String Sid, HttpServletResponse response) throws IOException {

        try {
            Integer id = Integer.parseInt(Sid);
            return DatabaseManager.createEntityManager().find(ShopItem.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private ShopItem createEventFromJson(JsonObject jEvent) {
        return updateEventFromJson(jEvent, new ShopItem());
    }

    private ShopItem updateEventFromJson(JsonObject jEvent, ShopItem e) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

        e = gson.fromJson(jEvent, ShopItem.class);

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

    private void removeEventFromDatabase(ShopItem e) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        e = DatabaseManager.createEntityManager().merge(e);
        DatabaseManager.createEntityManager().remove(e);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private void fillSizesFromJson(JsonObject jEvent, List<Color> colorList, List<Stock> stockList, ShopItem e) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        JsonArray stock = jEvent.getAsJsonArray("stock");

        for (int i = 0; i < stock.size(); ++i) {
            JsonObject st = stock.get(i).getAsJsonObject();
            JsonObject color = st.get("color").getAsJsonObject();
            Color c = gson.fromJson(color, Color.class);
            Stock s = new Stock();
            s.setColor(c);
            s.setItem(e);
            s.setSize(st.get("size").getAsString());
            s.setAmount(st.get("amount").getAsInt());
            colorList.add(c);
            stockList.add(s);
        }


    }

    private void saveEventToDatabase(ShopItem newShopItem, List<Color> colorList, List<Stock> stockList) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();

        for (Color i : colorList) {
            em.persist(i);
        }
        for (Stock i : stockList) {
            em.persist(i);
        }
        em.persist(newShopItem);

        em.getTransaction().commit();
    }

    private List<ShopItem> getEventsFromDatabase(String Sid, String searchTerm, String sType, String userId, String authorId,
                                                 HttpServletResponse response) throws IOException {

        List<ShopItem> shopItems = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            ShopItem e = getEventByID(Sid, response);
            if (e != null) {
                shopItems.add(e);
                return shopItems;
            }
        }

        if (isStringNotEmpty(searchTerm)) return getEventsBySearchTerm(searchTerm);

        if (isStringNotEmpty(sType)) return getEventsByType(getType(sType));

        if(isStringNotEmpty(userId)) return getEventsByUser(new Integer(userId));

        if(isStringNotEmpty(authorId)) return getEventsByAuthor(new Integer(authorId));

        return getEvents();
    }

    private List<ShopItem> getEventsBySearchTerm(String searchTerm) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e " +
                " WHERE UPPER(e.title) LIKE UPPER(:searchTerm) OR UPPER(e.description) LIKE UPPER(:searchTerm)", ShopItem.class)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    private List<ShopItem> getEventsByType(Integer type) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e " +
                " WHERE e.type = :type", ShopItem.class)
                .setParameter("type", type)
                .getResultList();
    }

    private List<ShopItem> getEventsByUser(Integer userId){
        //todo implement
        return new ArrayList<>();
    }

    private List<ShopItem> getEventsByAuthor(Integer authorId){
        return DatabaseManager.createEntityManager().createQuery("SELECT distinct e FROM ShopItem e " +
                " JOIN e.author a WHERE a.id = :author", ShopItem.class)
                .setParameter("author", authorId)
                .getResultList();
    }

    private List<ShopItem> getEvents() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM ShopItem e", ShopItem.class).getResultList();
    }

    private void updateEventAtDatabase(ShopItem e, List<Color> colorList, List<Stock> stockList) {
        EntityManager em = DatabaseManager.createEntityManager();


        em.getTransaction().begin();
        em.merge(e);
        em.getTransaction().commit();
    }
}
