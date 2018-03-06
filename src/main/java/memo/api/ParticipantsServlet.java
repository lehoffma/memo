package memo.api;

import memo.api.util.ApiServletPostOptions;
import memo.auth.api.ParticipantsAuthStrategy;
import memo.data.ParticipantRepository;
import memo.model.OrderedItem;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(name = "ParticipantsServlet", value = "/api/participants")
public class ParticipantsServlet extends AbstractApiServlet<OrderedItem> {

    public ParticipantsServlet() {
        super(new ParticipantsAuthStrategy());
        logger = Logger.getLogger(ParticipantsServlet.class);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> ParticipantRepository.getInstance().get(
                        getParameter(paramMap, "eventId"),
                        getParameter(paramMap, "type"),
                        _response
                ),
                "participants"
        );
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        this.post(request, response, new ApiServletPostOptions<>(
                        "participant", new OrderedItem(), OrderedItem.class, OrderedItem::getId
                )
        );
    }

}
