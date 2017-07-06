import { OneSignal } from '@ionic-native/onesignal';
import { Component } from '@angular/core';
import { NavController, ModalController } from "ionic-angular";

import { UserModel, SettingModel, LeaderModel, UpdatePasswordModel } from "../../models";
import { MainService, UserService, HelperService, LeaderService, CacheService } from "../../services/index";
import { HomePage } from "../home/home";
import { ActionCrudComponent } from "../../pages";
import { AlertHelper } from "../../helpers/alert-helper";
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'account.html'
})
export class AccountComponent {
    public selected: string = 'account';
    public settings:Array<SettingModel> = new Array<SettingModel>();
    public model: UserModel = new UserModel();
    private leaderModel: LeaderModel = new LeaderModel();
    public passwordModel: UpdatePasswordModel = new UpdatePasswordModel();
    public response:any = {};
    public showChangePassword:boolean = false;
    constructor(
        public navCtrl: NavController,
        private mainService: MainService,
        private userService: UserService,
        private leaderService: LeaderService,
        private modalCtrl: ModalController,
        private alertHelper: AlertHelper,
        private helperService: HelperService,
        private cacheService: CacheService,
        private oneSignal: OneSignal) {
            let id = this.mainService.currentUser.user_id;
            this.userService.get(id).subscribe(data => {
                this.response = data.json();
                this.leaderModel.email = this.model.email = this.response.email;
                this.leaderModel.names = this.model.names = this.response.names;
                this.leaderModel.leaderID = this.model.leaderID = this.response.leaderID;
                this.model.userID = this.response.userID;
                this.model.type = this.response.type;
                this.settings = this.response.userSettings;
                this.settings.forEach(element => {
                    element.value = element.settingValue == 'true'
                });
            }, error => {
                this.helperService.presentToastMessage(Configuration.ErrorMessage);
            });
    }

    public newAction(): void {
        let modal = this.modalCtrl.create(ActionCrudComponent);
        modal.present();
    }

    public send(form: any): void {
        if (form.valid) {
            this.leaderModel.email = this.model.email;
            this.leaderModel.names = this.model.names;

            this.leaderService.update(this.leaderModel).subscribe(data => {
                this.alertHelper.alert('Updated data');
            }, error => {
                this.helperService.presentToastMessage(Configuration.ErrorMessage);
            });
        }
    }

    public toogleMenu(): void {
         this.mainService.isOpenMenu = !this.mainService.isOpenMenu;
    }

    public updatePassword(form: any): void {
        if (form.valid) {
            this.leaderModel.password = this.passwordModel.password;
            this.leaderService.update(this.leaderModel).subscribe(data => {
                this.alertHelper.alert('Updated data');
            }, error => {
                this.helperService.presentToastMessage(Configuration.ErrorMessage);
            });
        }
    }

    public changeSetting(setting:SettingModel): void {
        setting.settingValue = setting.value ? 'true' : 'false';
        this.userService.updateSetting(this.model.userID, setting).subscribe(data => {}
        , error => {
            console.log(error);
        });
    }

    public logout(): void {
        localStorage.clear();
        this.cacheService.clearAll();
        this.oneSignal.deleteTag('user_id');
        let counter:number = this.navCtrl.length() - 1;
        this.navCtrl.remove(0, counter);
        this.navCtrl.setRoot(HomePage);
    }

    public filter(option: string): void {
        this.selected = option;
    }
}