package memo.serialization;

import memo.data.OrderRepository;
import memo.data.Repository;
import memo.model.Order;

public class OrderIdDeserializer extends IdDeserializer<Order> {
    public OrderIdDeserializer() {
        super(OrderRepository::getInstance, Repository::getById, Order.class);
    }
}
