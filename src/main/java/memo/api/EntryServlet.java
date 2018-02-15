package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.EntryRepository;
import memo.model.Entry;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
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

        List<Entry> entries = EntryRepository.getInstance().get(Sid, SeventId, sType, response);

        if (entries == null) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

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


        if (ApiUtils.stringIsNotEmpty(Sid) && entries.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, entries, "entries");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "entry");
        logger.debug("Method POST called");

        Entry entry = ApiUtils.getInstance().updateFromJson(jObj, new Entry(), Entry.class);
        //todo remove (das is nur nötig, weil die kategorien hardgecoded sind)
        DatabaseManager.getInstance().save(entry.getCategory());
        DatabaseManager.getInstance().save(entry);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, entry.getId(), "id");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "entry");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processInvalidError(response);
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
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().deleteFromDatabase(Entry.class, request, response);
    }

}
