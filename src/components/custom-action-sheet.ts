import { Platform, NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import { ActionSheetModel } from "../models/action-sheet-model";

@Component({
    templateUrl: 'custom-action-sheet.html'
})
export class CustomActionSheetComponent {
    public options:Array<ActionSheetModel>;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController) { 
            this.options = this.params.get('options');
        }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    public resolveHandler(event: Event, option: ActionSheetModel, data?: any): void {        
        event.stopPropagation();
        this.dismiss();
        
        if (option.handler != undefined) {
            option.handler.call(null, data);
        }        
    }
}