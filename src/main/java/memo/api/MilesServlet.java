package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.MilesRepository;
import memo.model.MilesListEntry;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "MilesServlet", value = "/api/miles")
public class MilesServlet extends AbstractApiServlet<MilesListEntry> {
    public MilesServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, MilesListEntry object) {
    }

    private LocalDateTime isoToDate(String isoDate) {
        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                .parse(isoDate);
        return LocalDateTime.from(minDateTemporalAccessor);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (parameterMap, _response) -> {
                    String userId = this.getParameter(parameterMap, "userId");
                    String from = this.getParameter(parameterMap, "from");
                    String to = this.getParameter(parameterMap, "to");
                    LocalDateTime start = from != null ? isoToDate(from) : null;
                    LocalDateTime end = to != null ? isoToDate(to) : null;

                    if (userId == null) {
                        if (start == null || end == null) {
                            return MilesRepository.milesList();
                        } else {
                            return MilesRepository.milesList(start, end);
                        }
                    } else {
                        List<MilesListEntry> milesListEntries = new ArrayList<>();
                        if (start == null || end == null) {
                            milesListEntries.add(MilesRepository.milesListEntryOfUser(Integer.valueOf(userId)));
                        } else {
                            milesListEntries.add(MilesRepository.milesListEntryOfUser(Integer.valueOf(userId), start, end));
                        }
                        return milesListEntries;
                    }
                },
                "miles"
        );
    }

}
