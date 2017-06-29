import { Component } from '@angular/core';
import { OneSignal } from '@ionic-native/onesignal';
import { NavController, LoadingController } from 'ionic-angular';

import { UserService, AuthService, MainService } from './../../services';
import { LoginModel } from './../../models';
import { ActionsPage } from "./../../pages";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public login: LoginModel = new LoginModel();

  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private authService: AuthService,
    private mainService: MainService,
    public loadingCtrl: LoadingController,
    private alertHelper: AlertHelper,
    private oneSignal: OneSignal) {
  }

  public send(form: any): void {
    if (form.valid) {
      let loader = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loader.present().then(t => {
        this.authService.getToken(this.login).subscribe(data => {
          loader.dismiss();
          this.mainService.currentUser = data.json();

          localStorage.setItem('accessToken', this.mainService.currentUser.access_token);
          localStorage.setItem('userID', this.mainService.currentUser.user_id.toString());
          localStorage.setItem('type', this.mainService.currentUser.user_type.toString());
          this.oneSignal.sendTag('user_id', this.mainService.currentUser.user_id.toString());          
          this.navCtrl.setRoot(ActionsPage);
        }, error => {
          loader.dismiss();
          let message = 'Invalid user!';
          if (error.status != 400) {
            message = 'Connection problem encountered';
          }

          this.alertHelper.alert(message);
        });
      });
    }
  }

  public forgot(): void {
    this.alertHelper.promp(
      'Login',
      "We'll email you instructions on how to reset it.",
      [
        {
          name: 'email',
          placeholder: 'Email'
        },
      ], data => {
        if (data.email != '') {
          this.userService.forgotten(data).subscribe(data => {
            this.alertHelper.alert('An email has been sent for you to change your password.');
          }, error => {
            if (error.status == 404) {
              this.alertHelper.alert('Invalid user');
            } else if (error.status == 400) {
              this.alertHelper.alert('Email format invalid');
            }
          });
        }
      });
  }
}
