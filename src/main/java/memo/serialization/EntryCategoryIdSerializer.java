package memo.serialization;

import memo.model.EntryCategory;

public class EntryCategoryIdSerializer extends IdSerializer<EntryCategory, Integer> {
    public EntryCategoryIdSerializer() {
        super(EntryCategory::getId, EntryCategory.class);
    }
}
