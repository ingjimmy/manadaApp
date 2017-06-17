import { UserService, AuthService, MainService, HelperService } from './../../services/index';
import { LoginModel } from './../../models/login-model';
import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ActionsPage } from "../actions/actions";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  login: LoginModel = new LoginModel();

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private userService: UserService,
    private authService: AuthService,
    private mainService: MainService,
    private helperService: HelperService,
    public loadingCtrl: LoadingController) {
  }

  send(form: any) {
    this.login.username = 'jimmy.rodriguez@dasigno.com';
    this.login.password = '123456';

    if (form.valid) {
      let loader = this.loadingCtrl.create({
        content: "Please wait..."
      });

      loader.present().then(() => {
        this.authService.getToken(this.login).subscribe(data => {
          loader.dismiss();
          this.mainService.currentUser = data.json();

          localStorage.setItem('accessToken', this.mainService.currentUser.access_token);
          localStorage.setItem('userID', this.mainService.currentUser.user_id);
          localStorage.setItem('type', this.mainService.currentUser.user_type);

          this.navCtrl.push(ActionsPage);
        }, error => {
          loader.dismiss();
          let message = 'Invalid user!';
          if (error.status != 400) {
            message = 'Connection problem encountered';
          }

          this.helperService.alert(message);
        });
      });
    }
  }

  forgot() {
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: "We'll email you instructions on how to reset it.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            if (data.email != '') {
              this.userService.forgotten(data).subscribe(data => {
                this.helperService.alert('An email has been sent for you to change your password.');
              }, error => {
                if (error.status == 404) {
                  this.helperService.alert('Invalid user');
                } else if (error.status == 400) {
                  this.helperService.alert('Email format invalid');
                }
              });
            }
          }
        }
      ]
    });
    prompt.present();
  }
}
