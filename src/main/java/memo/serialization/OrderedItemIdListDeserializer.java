package memo.serialization;

import memo.data.ParticipantRepository;
import memo.data.Repository;
import memo.model.OrderedItem;

public class OrderedItemIdListDeserializer extends IdListDeserializer<OrderedItem, ParticipantRepository> {
    public OrderedItemIdListDeserializer() {
        super(ParticipantRepository.class, Repository::getById, OrderedItem.class);
    }
}
