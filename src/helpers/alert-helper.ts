import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class AlertHelper {
    constructor(private alertCtrl: AlertController) {

    }
    public promp(title: string, message: string, inputs: Array<any>, call: (data: any) => void): void {
        let prompt = this.alertCtrl.create({
            title: title,
            message: message,
            inputs: inputs,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Send',
                    handler: call
                }
            ]
        });
        prompt.present();
    }

    public alert(message: string): void {
        let alert = this.alertCtrl.create({
            title: message,
            buttons: ['OK']
        });

        alert.present();
    }

    public confirm(message: string, call: () => void): void {
        let alert = this.alertCtrl.create({
            title: message,
            buttons: [
                {
                    text: 'Cancel'
                },
                {
                    text: 'Ok',
                    cssClass: 'custom-remove-confirm',
                    handler: call
                }
            ]
        });

        alert.present();
    }
}