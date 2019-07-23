package memo.serialization;

import memo.data.Repository;
import memo.discounts.data.DiscountRepository;
import memo.discounts.model.DiscountEntity;

public class DiscountIdListDeserializer extends IdListDeserializer<DiscountEntity, DiscountRepository> {
    public DiscountIdListDeserializer() {
        super(DiscountRepository.class, Repository::getById, DiscountEntity.class);
    }
}
