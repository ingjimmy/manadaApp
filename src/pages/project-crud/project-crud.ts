import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";

import { Configuration } from './../../configuration/configuration';
import { ProjectService, MainService, HelperService } from "../../services";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
    templateUrl: 'project-crud.html'
})
export class ProjectCrudComponent {
    public model: any = {};
    public updateProject: any;
    public isBusy: boolean = false;
    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private projectService: ProjectService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService) {
        this.model.name = '';
        this.updateProject = params.get('project');
        if (this.updateProject != undefined) {
            this.model.name = this.updateProject.name;
            this.model.projectID = this.updateProject.projectID;
        }
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    public send(form: any): void {
        if (form.valid && !this.isBusy) {
            this.isBusy = true;
            if (this.updateProject != undefined) {
                this.projectService.update(this.model).subscribe(data => {
                    this.updateProject.projectID = this.model.projectID;
                    this.updateProject.name = this.model.name;
                    this.isBusy = false;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    } else {
                        this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            } else {
                let flag: string = this.model.name;
                let count: number = 1;

                while (this.mainService.projects.find(t => t.name == flag) != undefined) {
                    flag = `${count} ${this.model.name}`;
                    count++;
                }

                this.model.name = flag;

                this.projectService.add(this.model).subscribe(data => {
                    this.mainService.bindProjects();
                    this.isBusy = false;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    } else {
                        this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            }
        }
    }
}