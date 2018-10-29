package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.MilesRepository;
import memo.model.MilesListEntry;
import memo.util.MapBuilder;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Path("/miles")
@Named
@RequestScoped
public class MilesServlet extends AbstractApiServlet<MilesListEntry> {
    private MilesRepository milesRepository;

    public MilesServlet() {
    }

    @Inject
    public MilesServlet(MilesRepository milesRepository,
                        AuthenticationService authService) {
        super(new ConfigurableAuthStrategy<>(true));
        this.milesRepository = milesRepository;
        this.authenticationService = authService;
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, MilesListEntry object) {
    }

    private LocalDateTime isoToDate(String isoDate) {
        TemporalAccessor minDateTemporalAccessor = DateTimeFormatter.ISO_DATE_TIME
                .parse(isoDate);
        return LocalDateTime.from(minDateTemporalAccessor);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Map<String, List<MilesListEntry>> get(
            @QueryParam("userId") String userId,
            @QueryParam("from") String from,
            @QueryParam("to") String to,
            @Context HttpServletRequest request) {

        List<MilesListEntry> milesList = this.getList(request,
                () -> {
                    LocalDateTime start = from != null ? isoToDate(from) : null;
                    LocalDateTime end = to != null ? isoToDate(to) : null;

                    if (userId == null) {
                        if (start == null || end == null) {
                            return milesRepository.milesList();
                        } else {
                            return milesRepository.milesList(start, end);
                        }
                    } else {
                        List<MilesListEntry> milesListEntries = new ArrayList<>();
                        if (start == null || end == null) {
                            milesListEntries.add(milesRepository.milesListEntryOfUser(Integer.valueOf(userId)));
                        } else {
                            milesListEntries.add(milesRepository.milesListEntryOfUser(Integer.valueOf(userId), start, end));
                        }
                        return milesListEntries;
                    }
                },
                null
        );

        return new MapBuilder<String, List<MilesListEntry>>()
                .buildPut("miles", milesList);
    }

}
