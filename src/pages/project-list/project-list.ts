import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";

import { MainService, ActionService, HelperService, CacheService } from './../../services';
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'project-list.html'
})
export class ProjectListPage {
    public action: any;

    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        public mainService: MainService,
        private actionService: ActionService,
        private cacheService: CacheService,
        private helperService: HelperService) {
        this.action = params.get('action');
    }

    public relation(project: any): void {
        if (this.cacheService.isOnline()) {
            if (this.action.projects.length == 0 || this.action.projects[0].projectID != project.projectID) {
                if (this.action.projects.length > 0) {
                    let projectID = this.action.projects[0].projectID;
                    let project = this.mainService.projects.find(t => t.projectID == projectID);
                    project.countActions -= 1;
                }

                this.action.projects = [];
                this.action.projects.push(project);

                project.countActions += 1;

                let countByProject = 0
                this.mainService.projects.forEach(element => {
                    countByProject += element.countActions;
                });

                this.mainService.projectRaw.countActions = this.mainService.countAll - countByProject;

                if (this.mainService.actionFilter.projectID != null && this.mainService.actionFilter.projectID != project.projectID) {
                    let index = this.mainService.actions.indexOf(this.action);
                    this.mainService.actions.splice(index, 1);
                }

                let index = this.mainService.projects.indexOf(project);
                this.mainService.projects.splice(index, 1);
                this.mainService.projects.splice(0, 0, project);

                this.actionService.updateLocalAction(this.action, false);
                this.actionService.changeStatus(this.action).subscribe(data => { },
                    error => {
                        console.log(error);
                    });
                this.dismiss();
            }
        } else {
            this.helperService.presentToastMessage(Configuration.ErrorMessage);
        }
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }
}