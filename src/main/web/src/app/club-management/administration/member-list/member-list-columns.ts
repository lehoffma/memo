import {ExpandableTableColumn} from "../../../shared/utility/expandable-table/expandable-table-column";
import {User} from "../../../shared/model/user";
import {ClubRoleTableCellComponent} from "../../../shared/utility/material-table/cells/clubrole-table-cell.component";
import {DateTableCellComponent} from "../../../shared/utility/material-table/cells/date-table-cell.component";
import {BooleanCheckMarkCellComponent} from "../../../shared/utility/material-table/cells/boolean-checkmark-cell.component";
import {GenderCellComponent} from "../../../shared/utility/material-table/cells/gender-cell.component";
import {AddressTableCellComponent} from "../../../shared/utility/material-table/cells/address-table-cell.component";
import {PictureTableCellComponent} from "../../../shared/utility/material-table/cells/picture-table-cell.component";

export const memberListColumns = {
	"images": new ExpandableTableColumn<User>("Foto", "images", PictureTableCellComponent),
	"firstName": new ExpandableTableColumn<User>("Vorname", "firstName"),
	"surname": new ExpandableTableColumn<User>("Nachname", "surname"),
	"clubRole": new ExpandableTableColumn<User>("Rolle", "clubRole", ClubRoleTableCellComponent),
	"birthday": new ExpandableTableColumn<User>("Geburtstag", "birthday", DateTableCellComponent),
	"hasSeasonTicket": new ExpandableTableColumn<User>("Dauerkarte", "hasSeasonTicket", BooleanCheckMarkCellComponent),
	"isWoelfeClubMember": new ExpandableTableColumn<User>("Wölfecard", "isWoelfeClubMember", BooleanCheckMarkCellComponent),
	"gender": new ExpandableTableColumn<User>("Geschlecht", "gender", GenderCellComponent),
	"joinDate": new ExpandableTableColumn<User>("Eintrittsjahr", "joinDate", DateTableCellComponent),
	"address": new ExpandableTableColumn<User>("Addressen", "addresses", AddressTableCellComponent),
	// "telephone": new ExpandableTableColumn<User>("Festnetz", "telephone", TelephoneTableCellComponent),
	// "mobile": new ExpandableTableColumn<User>("Handy", "mobile", MobileTableCellComponent),
	// "email": new ExpandableTableColumn<User>("Email", "email", EmailTableCellComponent),
	// "profile": new ExpandableTableColumn<User>("Profil", "id", ProfileLinkCellComponent)
};
