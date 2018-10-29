package memo.data;

import memo.model.EventCapacity;
import memo.model.OrderStatus;
import memo.model.OrderedItem;
import memo.model.ShopItem;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import java.util.Optional;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class CapacityService {

    private ParticipantRepository participantRepository;
    private EventRepository eventRepository;

    public CapacityService() {
    }

    @Inject
    public CapacityService(ParticipantRepository participantRepository,
                           EventRepository eventRepository) {
        this.participantRepository = participantRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Checks whether the given order is valid, i.e. whether the orderedItem's status is not "refused" or "cancelled"
     *
     * @param orderedItem the ordered item object to check
     * @return true if valid (i.e. status != refused && status != cancelled)
     */
    private boolean orderIsValid(OrderedItem orderedItem) {
        OrderStatus status = orderedItem.getStatus();
        return status != OrderStatus.Refused && status != OrderStatus.Cancelled;
    }

    private Integer getAmountOfValidOrders(ShopItem item) {
        return participantRepository.findByEvent(item.getId()).stream()
                .filter(this::orderIsValid)
                .collect(Collectors.toList())
                .size();
    }

    public Optional<EventCapacity> get(Integer eventId) {
        return eventRepository.getById(eventId)
                .map(shopItem -> new EventCapacity()
                        .setEventId(shopItem.getId())
                        .setCapacity(shopItem.getCapacity() - getAmountOfValidOrders(shopItem)));
    }
}
