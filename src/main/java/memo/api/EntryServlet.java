package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.EntryAuthStrategy;
import memo.data.EntryRepository;
import memo.model.Entry;
import memo.model.EntryCategory;
import memo.model.Image;
import memo.model.ShopItem;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;


@WebServlet(name = "EntryServlet", value = "/api/entry")
public class EntryServlet extends AbstractApiServlet<Entry> {

    final static Logger logger = Logger.getLogger(EntryServlet.class);

    public EntryServlet() {
        super(new EntryAuthStrategy());
    }

    private boolean matchesDate(Entry entry, String requestString, boolean isMinDate) {
        if (requestString != null) {
            TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                    .parse(requestString);
            LocalDateTime requestDate = LocalDateTime.from(minDateTemporalAccessor);
            LocalDate date = entry.getDate().toLocalDateTime().toLocalDate();
            return isMinDate
                    ? (requestDate.isBefore(date.atStartOfDay()) || requestDate.isEqual(date.atStartOfDay()))
                    : (requestDate.isAfter(date.atStartOfDay()) || requestDate.isEqual(date.atStartOfDay()));
        }
        return true;
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (parameterMap, _response) -> EntryRepository.getInstance().get(
                        getParameter(parameterMap, "id"),
                        getParameter(parameterMap, "eventId"),
                        getParameter(parameterMap, "eventType"),
                        response),
                "entries",
                entry -> matchesDate(entry, request.getParameter("minDate"), true)
                        && matchesDate(entry, request.getParameter("maxDate"), false)
        );
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, Entry object) {
        this.manyToOne(object, ShopItem.class, Entry::getItem, Entry::getId, ShopItem::getEntries, shopItem -> shopItem::setEntries);
        this.manyToOne(object, EntryCategory.class, Entry::getCategory, Entry::getId, EntryCategory::getEntry, entryCategory -> entryCategory::setEntry);
        this.oneToMany(object, Image.class, Entry::getImages, image -> image::setEntry);
        //todo remove (das is nur nötig, weil die kategorien hardgecoded sind)
        DatabaseManager.getInstance().save(object.getCategory(), EntryCategory.class);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        this.post(request, response, new ApiServletPostOptions<>(
                "entry", new Entry(), Entry.class, Entry::getId
        ));
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {
        this.put(request, response, new ApiServletPutOptions<>(
                "entry", Entry.class, Entry::getId
        ));
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        this.delete(Entry.class, request, response);
    }

}
