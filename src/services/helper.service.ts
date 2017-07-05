import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

@Injectable()
export class HelperService {

  constructor(private toastCtrl: ToastController) { }

  public removeFromArray(array: Array<any>, item: any): void {
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

  public getShortSubject(subject: string): string {
    if (subject != '') {
      let reg = /(<([^>]+)>)/ig
      let shortSubject = subject.replace(reg, '');
      if (shortSubject.length > 140) {
        shortSubject = shortSubject.substring(0, 139);
      }      

      return shortSubject;
    } else {
      return '';
    }
  }
}
