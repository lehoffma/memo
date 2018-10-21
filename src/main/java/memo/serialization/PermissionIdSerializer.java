package memo.serialization;

import memo.model.PermissionState;

public class PermissionIdSerializer extends IdSerializer<PermissionState, Integer> {
    public PermissionIdSerializer() {
        super(PermissionState::getId, PermissionState.class);
    }
}
