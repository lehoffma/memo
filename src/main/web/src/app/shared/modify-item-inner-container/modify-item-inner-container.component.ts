import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
	selector: 'memo-modify-item-inner-container',
	templateUrl: './modify-item-inner-container.component.html',
	styleUrls: ['./modify-item-inner-container.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModifyItemInnerContainerComponent implements OnInit {
	@Input() title:string;

	@Input() formIsValid:boolean = false;
	@Input() saveButton:boolean = true;

	@Output() onSave: EventEmitter<any> = new EventEmitter();


	constructor() {
	}

	ngOnInit() {
	}

}
