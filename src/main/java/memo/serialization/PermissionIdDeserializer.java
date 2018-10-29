package memo.serialization;

import memo.data.PermissionRepository;
import memo.data.Repository;
import memo.model.PermissionState;

public class PermissionIdDeserializer extends IdDeserializer<PermissionState, PermissionRepository> {

    public PermissionIdDeserializer() {
        super(PermissionRepository.class, Repository::getById, PermissionState.class);
    }
}
