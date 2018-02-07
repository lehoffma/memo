package memo.model;

/*
     0 : None,
	 1 : read,
	 2 : write,
	 3 : create,
	 4 : delete,
	 5 : admin
	  */

import com.fasterxml.jackson.annotation.JsonValue;

public enum Permission {
    none,
    read,
    write,
    create,
    delete,
    admin;

    @JsonValue
    public int toValue() {
        return ordinal();
    }
}


