import { MainService } from './../../services/main.service';
import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from "ionic-angular";
import { ActionService } from "../../services/index";

@Component({
    templateUrl: 'project-list.html'
})
export class ProjectListPage {
    action: any;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public mainService: MainService,
        private actionService: ActionService) {
        this.action = params.get('action');
    }

    relation(project: any) {
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

            this.actionService.changeStatus(this.action).subscribe();
            this.dismiss();
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}