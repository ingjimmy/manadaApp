import { IonicStorageModule } from '@ionic/storage';
import { Transfer } from '@ionic-native/transfer';
import { RequestOptions, HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Keyboard } from '@ionic-native/keyboard';
import { Camera } from "@ionic-native/camera";
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { BrowserTab } from "@ionic-native/browser-tab";
import { OneSignal } from '@ionic-native/onesignal';

import { AuthService, ActionService, CommentService, HelperService, MainService, ProjectService, UserService, FileService, LeaderService, CacheService } from './../services';
import { MyApp } from './app.component';
import { HomePage, ActionsPage, ActionListComponent, ProjectListPage, AccountComponent, UserCrudComponent, ProjectCrudComponent, ActionCrudComponent, CalendarComponent, ActionDetailComponent, CommentCrudComponent } from '../pages';
import { CustomRequestOptions } from "../configuration/custom-request-options";
import { DateColorPipe, CommentTypePipe, TillDatePipe, FormatDatePipe } from "../pipes";
import { AlertHelper } from "../helpers/alert-helper";
import { CameraHelper } from "../helpers/camera-helper";
import { CustomActionSheetComponent } from "../components/custom-action-sheet";
import { Focuser } from "../directives/aut-focus";

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ActionsPage,
    ActionListComponent,
    DateColorPipe,
    ProjectListPage,
    AccountComponent,
    UserCrudComponent,
    ProjectCrudComponent,
    ActionCrudComponent,
    CalendarComponent,
    ActionDetailComponent,
    CommentTypePipe,
    TillDatePipe,
    CommentCrudComponent,
    CustomActionSheetComponent,
    Focuser,
    FormatDatePipe
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      platforms: {
        ios: {
          statusbarPadding: false,
          scrollAssist: true,
          autoFocusAssist: false,
          inputBlurring: false
        }
      }
    }),
    IonicStorageModule.forRoot({
      name: 'manadadb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ActionsPage,
    ActionListComponent,
    ProjectListPage,
    AccountComponent,
    UserCrudComponent,
    ProjectCrudComponent,
    ActionCrudComponent,
    CalendarComponent,
    ActionDetailComponent,
    CommentCrudComponent,
    CustomActionSheetComponent
  ],
  providers: [
    Keyboard,
    StatusBar,
    SplashScreen,
    ActionService,
    AuthService,
    CommentService,
    HelperService,
    MainService,
    ProjectService,
    UserService,
    FileService,
    Camera,
    Transfer,
    PhotoViewer,
    BrowserTab,
    AlertHelper,
    CameraHelper,
    LeaderService,
    OneSignal,
    CacheService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: RequestOptions, useClass: CustomRequestOptions },
  ]
})
export class AppModule { }
