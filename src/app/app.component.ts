import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';
import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { OneSignal } from "@ionic-native/onesignal";

import { ActionModel, TokenModel } from './../models';
import { MainService } from './../services';
import { ActionDetailComponent, HomePage, ActionsPage } from './../pages';
import { AlertHelper } from "../helpers/alert-helper";
import { Configuration } from "../configuration/configuration";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('navApp') nav: NavController
  public rootPage: any;
  public actionID?: number = null;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private mainService: MainService,
    private keyboard: Keyboard,
    private oneSignal: OneSignal,
    private alertHelper: AlertHelper) {
    platform.ready().then(() => {
      if (localStorage.getItem('accessToken') !== null) {
        mainService.currentUser = new TokenModel();
        mainService.currentUser.access_token = localStorage.getItem('accessToken');
        mainService.currentUser.user_id = parseInt(localStorage.getItem('userID'));
        mainService.currentUser.user_type = parseInt(localStorage.getItem('type'));

        this.rootPage = ActionsPage;
      } else {
        this.rootPage = HomePage;
      }

      this.oneSignal.startInit(Configuration.OneSignalKey, Configuration.GoogleID);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationOpened().subscribe(data => {
        let action: ActionModel = new ActionModel();
        action.actionID = parseInt(data.notification.payload.additionalData.id);
        action.creator = { names: '' };
        this.nav.push(ActionDetailComponent, { action: action });
      }, error => {
        console.log(error);
      });
      this.oneSignal.endInit();
      if (this.platform.is('ios')) {
        this.statusBar.overlaysWebView(true);
        this.statusBar.hide();
      } else {
        this.statusBar.styleDefault();
      }

      this.splashScreen.hide();
      this.keyboard.disableScroll(true);
    });
  }
}