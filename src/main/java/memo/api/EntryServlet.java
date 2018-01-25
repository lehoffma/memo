package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import memo.model.Entry;
import org.apache.log4j.Logger;

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


@WebServlet(name = "EntryServlet", value = "/api/entry")
public class EntryServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(EntryServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        String Sid = request.getParameter("id");
        String SeventId = request.getParameter("eventId");
        String sType = request.getParameter("eventType");

        logger.debug("Method GET called with param ID = " + Sid);

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


        if (entries.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, entries, "entries");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "entry");
        logger.debug("Method POST called");

        Entry a = ApiUtils.getInstance().updateFromJson(jObj, new Entry(), Entry.class);
        DatabaseManager.getInstance().save(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response,a.getId(),"id");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "entry");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processNotInvalidError(response);
            return;
        }

        Entry a = DatabaseManager.getInstance().getById(Entry.class, jObj.get("id").asInt());

        if (a == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }


        a = ApiUtils.getInstance().updateFromJson(jObj, a, Entry.class);
        DatabaseManager.getInstance().update(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response,a.getId(),"id");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().deleteFromDatabase(Entry.class, request, response);
    }


    private List<Entry> getEntriesFromDatabase(String Sid, String SeventId, String sType, HttpServletResponse response) {

        List<Entry> entries = new ArrayList<>();

        // if ID is submitted
        if (ApiUtils.getInstance().isStringNotEmpty(Sid)) {

            Entry e = DatabaseManager.getInstance().getByStringId(Entry.class,Sid);
            if (e != null) {
                entries.add(e);
                return entries;
            }
        }

        if (ApiUtils.getInstance().isStringNotEmpty(SeventId)) return getEntriesByEventId(SeventId, response);

        if (ApiUtils.getInstance().isStringNotEmpty(sType)) return getEntriesByEventType(EventServlet.getType(sType), response);

        return getEntries();
    }

    /*
    private Entry updateEntryFromJson(JsonNode jEntry, Entry entry) {


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
    */


    private List<Entry> getEntriesByEventId(String SeventId, HttpServletResponse response) {
        try {
            Integer id = Integer.parseInt(SeventId);

            return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                    " WHERE e.item.id = :Id", Entry.class)
                    .setParameter("Id", id)
                    .getResultList();

        } catch (NumberFormatException e) {
            logger.error("Parsing error", e);
            ApiUtils.getInstance().processNotInvalidError(response);
        }
        return null;
    }

    private List<Entry> getEntriesByEventType(Integer type, HttpServletResponse response) {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e " +
                " WHERE e.item.type = :typ", Entry.class)
                .setParameter("typ", type)
                .getResultList();
    }

    private List<Entry> getEntries() {
        return DatabaseManager.createEntityManager().createQuery("SELECT e FROM Entry e", Entry.class).getResultList();
    }

}
