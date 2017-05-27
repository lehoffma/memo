package memo.model;



	/*
	 0 : none,
	 1 : member,
	 2 : board,
	 3 : secretary,
	 4 : funds,
	 5 : organizer,
	 6 : admin
	  */


import com.google.gson.annotations.SerializedName;

public enum ClubRole {
	@SerializedName("0")
	none,
	@SerializedName("1")
	Mitglied,
	@SerializedName("2")
	Vorstand,
	@SerializedName("3")
	Schriftführer,
	@SerializedName("4")
	Kassenwart,
	@SerializedName("5")
	Organisator,
	@SerializedName("6")
	Admin
}