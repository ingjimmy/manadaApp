import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  constructor(private toastCtrl: ToastController) { }

  removeFromArray(array: Array<any>, item: any) {
    let index = array.indexOf(item);
    array.splice(index, 1);
  }

  public presentToastMessage(message: string): void {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });

    toast.present();
  }
}
