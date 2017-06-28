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

import { AuthService, ActionService, CommentService, HelperService, MainService, ProjectService, UserService, FileService, LeaderService } from './../services';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CustomRequestOptions } from "../configuration/custom-request-options";
import { ActionsPage } from "../pages/actions/actions";
import { ActionListComponent } from "../pages/action-list/action-list";
import { DateColorPipe } from "../pipes/date-color/date-color";
import { ProjectListPage } from "../pages/project-list/project-list";
import { AccountComponent } from "../pages/account/account";
import { UserCrudComponent } from "../pages/user-crud/user-crud";
import { ProjectCrudComponent } from "../pages/project-crud/project-crud";
import { ActionCrudComponent } from "../pages/action-crud/action-crud";
import { CalendarComponent } from "../pages/calendar/calendar";
import { ActionDetailComponent } from "../pages/action-detail/action-detail";
import { CommentTypePipe } from "../pipes/comment-type/comment-type";
import { TillDatePipe } from '../pipes/till-date/till-date';
import { CommentCrudComponent } from "../pages/comment-crud/comment-crud";
import { AlertHelper } from "../helpers/alert-helper";
import { CameraHelper } from "../helpers/camera-helper";
import { CustomActionSheetComponent } from "../components/custom-action-sheet";
import { Focuser } from "../directives/aut-focus";
import { CacheService } from "../services/cache.service";
import { FormatDatePipe } from '../pipes/format-date/format-date';

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
        ios: {
          scrollAssist: false, 
          autoFocusAssist: false,
          inputBlurring: false
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
