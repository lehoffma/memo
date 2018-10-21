package memo.serialization;

import memo.data.PermissionRepository;
import memo.data.Repository;
import memo.model.PermissionState;

public class PermissionIdDeserializer extends IdDeserializer<PermissionState> {

    public PermissionIdDeserializer() {
        super(PermissionRepository::getInstance, Repository::getById, PermissionState.class);
    }
}
