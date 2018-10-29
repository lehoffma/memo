package memo.serialization;

import memo.data.EntryCategoryRepository;
import memo.data.Repository;
import memo.model.EntryCategory;

public class EntryCategoryIdDeserializer extends IdDeserializer<EntryCategory, EntryCategoryRepository> {
    public EntryCategoryIdDeserializer() {
        super(EntryCategoryRepository.class, Repository::getById, EntryCategory.class);
    }

}
