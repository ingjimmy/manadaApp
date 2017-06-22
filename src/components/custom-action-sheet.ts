import { Platform, NavParams, ViewController } from 'ionic-angular';
import { Component, ViewChild } from '@angular/core';
import { ActionSheetModel } from "../models/action-sheet-model";

@Component({
    templateUrl: 'custom-action-sheet.html'
})
export class CustomActionSheetComponent {
    public options:Array<ActionSheetModel>;
    @ViewChild('background') background;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController) { 
            this.options = this.params.get('options');
        }
    
    public ionViewDidLoad(): void {
        setTimeout(() => {
            this.background.nativeElement.style.opacity = 0.4;
        }, 200);
    }

    public dismiss(): void {
        this.background.nativeElement.style.opacity = 0;
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