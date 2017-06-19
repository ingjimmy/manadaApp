import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

import { HomePage } from '../pages/home/home';
import { TokenModel } from "../models/token-model";
import { MainService } from './../services/index';
import { ActionsPage } from './../pages/actions/actions';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  public rootPage: any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, mainService: MainService, private keyboard: Keyboard) {
    platform.ready().then(() => {
      if (localStorage.getItem('accessToken') !== null) {
        mainService.currentUser = new TokenModel();
        mainService.currentUser.access_token = localStorage.getItem('accessToken');
        mainService.currentUser.user_id = localStorage.getItem('userID');
        mainService.currentUser.user_type = localStorage.getItem('type');

        this.rootPage = ActionsPage;
      } else {
        this.rootPage = HomePage;
      }

      statusBar.styleDefault();
      splashScreen.hide();
      this.keyboard.disableScroll(true);
    });
  }
}