package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.EntryCategoryRepository;
import memo.model.EntryCategory;
import memo.util.model.Page;
import memo.util.model.PageRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Path("/entryCategory")
@Named
@RequestScoped
public class EntryCategoryServlet extends AbstractApiServlet<EntryCategory> {
    private EntryCategoryRepository entryCategoryRepository;
    final static Logger logger = LogManager.getLogger(EntryCategoryServlet.class);

    public EntryCategoryServlet() {
    }

    @Inject
    public EntryCategoryServlet(EntryCategoryRepository entryCategoryRepository,
                                AuthenticationService authService) {
        super(new ConfigurableAuthStrategy<>(true));
        this.entryCategoryRepository = entryCategoryRepository;
        this.authenticationService = authService;
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        List<EntryCategory> categories = entryCategoryRepository.getAll();
        return new Page(categories, new PageRequest(), categories.size());
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, EntryCategory object) {
    }
}
