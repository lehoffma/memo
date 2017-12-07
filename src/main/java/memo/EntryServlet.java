package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Entry;
import memo.model.EntryCategory;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

//Tested

@WebServlet(name = "EntryServlet", value = "/api/entry")
public class EntryServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement
        setContentType(request, response);

        String Sid = request.getParameter("id");
        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("eventType");

        List<Entry> entries = getEntriesFromDatabase(Sid, SeventId, sType, response);


        //todo durch sql ersetzen keine ahnung
        if (request.getParameter("minDate") != null) {
            entries = entries.stream()
                    .filter(entry -> {
                        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                                .parse(request.getParameter("minDate"));
                        LocalDateTime minDate = LocalDateTime.from(minDateTemporalAccessor);
                        LocalDate date = entry.getDate().toLocalDate();
                        return minDate.isBefore(date.atStartOfDay()) || minDate.isEqual(date.atStartOfDay());
                    })
                    .collect(Collectors.toList());
        }
        if (request.getParameter("maxDate") != null) {
            entries = entries.stream()
                    .filter(entry -> {
                        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                                .parse(request.getParameter("maxDate"));
                        LocalDateTime maxDate = LocalDateTime.from(minDateTemporalAccessor);
                        LocalDate date = entry.getDate().toLocalDate();
                        return maxDate.isAfter(date.atStartOfDay()) || maxDate.isEqual(date.atStartOfDay());
                    })
                    .collect(Collectors.toList());
        }


        /*
        if (entries.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }
        */

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(entries);

        response.getWriter().append("{ \"entries\": " + output + " }");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement

        setContentType(request, response);

        JsonObject jEntry = getJsonEntry(request, response);

        Entry e = createEntryFromJson(jEntry);

        saveEntryToDatabase(e);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jEntry = getJsonEntry(request, response);

        String jId = jEntry.get("id").getAsString();

        Entry e = getEntryByID(jId, response);

        if (e == null) {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }

        e = updateEntryFromJson(jEntry, e);
        e.setId(jEntry.get("id").getAsInt());

        updateEntryAtDatabase(e);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + e.getId() + " }");


    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //TODO: implement
        setContentType(request, response);

        String Sid = request.getParameter("id");

        Entry e = getEntryByID(Sid, response);

        if (e == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeEntryFromDatabase(e);
    }

    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<Entry> getEntriesFromDatabase(String Sid, String SeventId, String sType, HttpServletResponse response) throws IOException {

        List<Entry> orders = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            Entry e = getEntryByID(Sid, response);
            if (e != null) {
                orders.add(e);
                return orders;
            }
        }

        if (isStringNotEmpty(SeventId)) return getEntriesByEventId(SeventId, response);

        if (isStringNotEmpty(sType)) return getEntriesByEventType(EventServlet.getType(sType), response);

        return getEntries();
    }

    private JsonObject getJsonEntry(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("entry");
    }

    private Entry createEntryFromJson(JsonObject jEntry) {
        return updateEntryFromJson(jEntry, new Entry());
    }

    private Entry updateEntryFromJson(JsonObject jEntry, Entry entry) {

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        // save params to new user
        entry = gson.fromJson(jEntry, Entry.class);

        try {
            entry.setItem(new EventServlet().getEventByID(jEntry.getAsJsonObject("event").get("id").getAsString(), null));
        } catch (IOException e) {
            //todo logger.log(Level.DANGER, "Could not find event associated with entry", e)
        }

        entry.setCategory(DatabaseManager.createEntityManager().find(EntryCategory.class,jEntry.get("category").getAsJsonObject().get("id").getAsInt()));

        TemporalAccessor day = DateTimeFormatter.ISO_DATE_TIME.parse(jEntry.get("date").getAsString());
        LocalDateTime date = LocalDateTime.from(day);
        entry.setDate(date);

        return entry;
    }

    private void saveEntryToDatabase(Entry e) {
        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(e);
        em.getTransaction().commit();
    }

    private void updateEntryAtDatabase(Entry newEntry) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.merge(newEntry);
        em.getTransaction().commit();
    }


    private List<Entry> getEntriesByEventId(String SeventId, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(SeventId);

            return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                    " WHERE e.event.id = :Id", Entry.class)
                    .setParameter("Id", id)
                    .getResultList();

        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private Entry getEntryByID(String Sid, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(Sid);
            return DatabaseManager.createEntityManager().find(Entry.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<Entry> getEntriesByEventType(Integer type, HttpServletResponse response) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                " WHERE e.event.type = :typ", Entry.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<Entry> getEntries() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e", Entry.class).getResultList();
    }

    private void removeEntryFromDatabase(Entry e) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        e = DatabaseManager.createEntityManager().merge(e);
        DatabaseManager.createEntityManager().remove(e);
        DatabaseManager.createEntityManager().getTransaction().commit();

    }


}
