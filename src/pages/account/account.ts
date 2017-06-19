import { Component } from '@angular/core';
import { UserModel } from "../../models/user-model";
import { MainService, UserService } from "../../services/index";
import { SettingModel } from "../../models/settings-model";
import { NavController } from "ionic-angular";
import { HomePage } from "../home/home";

@Component({
    templateUrl: 'account.html'
})
export class AccountComponent {
    public selected: string = 'account';
    public settings:Array<SettingModel> = new Array<SettingModel>();
    public model: UserModel = new UserModel();
    public response:any = {};
    constructor(
        public navCtrl: NavController,
        private mainService: MainService,
        private userService: UserService) {
            let id = parseInt(this.mainService.currentUser.user_id);
            this.userService.get(id).subscribe(data => {
                this.response = data.json();
                this.model.email = this.response.email;
                this.model.names = this.response.names;
                this.model.leaderID = this.response.leaderID;
                this.model.userID = this.response.userID;
                this.model.type = this.response.type;
                this.settings = this.response.userSettings;
                this.settings.forEach(element => {
                    element.value = element.settingValue == 'true'
                });
            });
    }

    public change(): void {

    }

    public newAction(): void {

    }

    public send(): void {
        console.log(this.model);
    }

    public changeSetting(setting:SettingModel): void {
        setting.settingValue = setting.value ? 'true' : 'false';
        this.userService.updateSetting(this.model.userID, setting).subscribe();
    }

    public logout(): void {
        localStorage.clear();
        this.navCtrl.setRoot(HomePage);
    }
}