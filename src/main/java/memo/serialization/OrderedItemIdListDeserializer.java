package memo.serialization;

import memo.data.ParticipantRepository;
import memo.data.Repository;
import memo.model.OrderedItem;

public class OrderedItemIdListDeserializer extends IdListDeserializer<OrderedItem> {
    public OrderedItemIdListDeserializer() {
        super(ParticipantRepository::getInstance, Repository::getById, OrderedItem.class);
    }
}
