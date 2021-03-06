package memo.communication;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import memo.data.*;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class DataParser {
    private EventRepository eventRepository;
    private OrderRepository orderRepository;
    private ParticipantRepository participantRepository;
    private UserRepository userRepository;
    private BankAccountRepository bankAccountRepository;

    public DataParser() {
    }

    @Inject
    public DataParser(EventRepository eventRepository,
                      OrderRepository orderRepository,
                      UserRepository userRepository,
                      ParticipantRepository participantRepository,
                      BankAccountRepository bankAccountRepository) {
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.bankAccountRepository = bankAccountRepository;
    }

    private static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    private static final Logger logger = LogManager.getLogger(DataParser.class);

    private Map.Entry<String, Object> parse(Map.Entry<String, Object> entry) {
        String key = entry.getKey();
        Object value = entry.getValue();

        switch (entry.getKey()) {
            case "itemId":
                key = "item";
                value = eventRepository.getById(entry.getValue().toString())
                        .orElse(null);
                break;
            case "userId":
                key = "user";
                value = userRepository.getById(entry.getValue().toString())
                        .orElse(null);
                break;
            case "orderedItemIds":
                key = "orderedItems";
                try {
                    String ids = entry.getValue().toString();
                    ObjectMapper objectMapper = new ObjectMapper();
                    List<Integer> idList = objectMapper.readValue(ids, List.class);
                    value = idList.stream()
                            .map(id -> participantRepository.getById(id).orElse(null))
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                } catch (IOException e) {
                    logger.error("Could not convert data to ID List: " + entry.getValue(), e);
                    value = new ArrayList<>();
                }
                break;
            case "orderId":
                key = "order";
                value = orderRepository.getById(entry.getValue().toString())
                        .orElse(null);
                break;
            case "bankAccId":
                key = "bankAcc";
                value = bankAccountRepository.getById(entry.getValue().toString())
                        .orElse(null);
                break;
        }
        //default: dont't parse anything
        return new AbstractMap.SimpleEntry<>(key, value);
    }


    public Map<String, Object> parse(String json) {
        HashMap<String, Object> data;
        try {
            TypeReference<HashMap<String, Object>> typeRef = new TypeReference<HashMap<String, Object>>() {
            };
            data = mapper.readValue(json, typeRef);
        } catch (IOException e) {
            logger.error("Could not parse json data of notification", e);
            return new HashMap<>();
        }

        return data.entrySet().stream()
                .map(this::parse)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue
                ));
    }
}
