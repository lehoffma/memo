package memo.data;

import memo.model.EventCapacity;
import memo.model.OrderStatus;
import memo.model.OrderedItem;
import memo.model.ShopItem;

import java.util.Optional;
import java.util.stream.Collectors;

public class CapacityService {

    /**
     * Checks whether the given order is valid, i.e. whether the orderedItem's status is not "refused" or "cancelled"
     *
     * @param orderedItem the ordered item object to check
     * @return true if valid (i.e. status != refused && status != cancelled)
     */
    private static boolean orderIsValid(OrderedItem orderedItem) {
        OrderStatus status = orderedItem.getStatus();
        return status != OrderStatus.Refused && status != OrderStatus.Cancelled;
    }

    private static Integer getAmountOfValidOrders(ShopItem item) {
        return ParticipantRepository.getInstance().findByEvent(item.getId()).stream()
                .filter(CapacityService::orderIsValid)
                .collect(Collectors.toList())
                .size();
    }

    public static Optional<EventCapacity> get(Integer eventId) {
        return EventRepository.getInstance().getById(eventId)
                .map(shopItem -> new EventCapacity()
                        .setEventId(shopItem.getId())
                        .setCapacity(shopItem.getCapacity() - getAmountOfValidOrders(shopItem)));
    }
}
