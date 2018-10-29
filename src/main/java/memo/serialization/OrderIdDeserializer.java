package memo.serialization;

import memo.data.OrderRepository;
import memo.data.Repository;
import memo.model.Order;

public class OrderIdDeserializer extends IdDeserializer<Order, OrderRepository> {
    public OrderIdDeserializer() {
        super(OrderRepository.class, Repository::getById, Order.class);
    }
}
