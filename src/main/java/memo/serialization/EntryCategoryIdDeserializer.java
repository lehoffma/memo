package memo.serialization;

import memo.data.EntryCategoryRepository;
import memo.data.Repository;
import memo.model.EntryCategory;

public class EntryCategoryIdDeserializer extends IdDeserializer<EntryCategory> {
    public EntryCategoryIdDeserializer() {
        super(EntryCategoryRepository::getInstance, Repository::getById, EntryCategory.class);
    }

}
