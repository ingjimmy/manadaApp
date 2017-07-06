import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from 'ionic-angular';

import { ActionSheetModel } from "../models";

@Component({
    templateUrl: 'custom-action-sheet.html'
})
export class CustomActionSheetComponent {
    public options:Array<ActionSheetModel>;
    private dvBack:any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController) { 
            this.options = this.params.get('options');
        }
    
    public ionViewDidLoad(): void {
        this.dvBack = document.createElement('div');
        this.dvBack.className = 'custom-background';
        document.querySelectorAll('ion-app')[0].appendChild(this.dvBack);
        
        setTimeout(() => {
            this.dvBack.style.opacity = '0.4';            
        }, 10);
    }

    public dismiss(): void {
        this.dvBack.style.opacity = '0';
        this.viewCtrl.dismiss();
        setTimeout(() => {
            this.dvBack.remove();            
        }, 300);        
    }

    public resolveHandler(event: Event, option: ActionSheetModel, data?: any): void {        
        event.stopPropagation();
        this.dismiss();
        
        if (option.handler != undefined) {
            option.handler.call(null, data);
        }        
    }
}