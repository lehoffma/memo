package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.api.strategy.ConfigurableAuthStrategy;
import memo.data.EntryCategoryRepository;
import memo.model.EntryCategory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "EntryCategoryServlet", value = "/api/entryCategory")
public class EntryCategoryServlet extends AbstractApiServlet<EntryCategory> {

    final static Logger logger = LogManager.getLogger(EntryCategoryServlet.class);

    public EntryCategoryServlet() {
        super(new ConfigurableAuthStrategy<>(true));
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response, EntryCategoryRepository.getInstance(), "categories");
    }

    @Override
    protected void updateDependencies(JsonNode jsonNode, EntryCategory object) {
    }
}
