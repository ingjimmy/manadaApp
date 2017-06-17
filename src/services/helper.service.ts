import { Injectable } from '@angular/core';
import { AlertController } from "ionic-angular";

@Injectable()
export class HelperService {

  constructor(private alertCtrl: AlertController) { }

  removeFromArray(array: Array<any>, item: any) {
    let index = array.indexOf(item);
    array.splice(index, 1);
  }

  public alert(message: string) {
    let alert = this.alertCtrl.create({
      title: message,
      buttons: ['OK']
    });

    alert.present();
  }
}
