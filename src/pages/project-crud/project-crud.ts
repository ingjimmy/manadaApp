import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from "ionic-angular";
import { ProjectService, MainService, HelperService } from "../../services/index";

@Component({
    templateUrl: 'project-crud.html'
})
export class ProjectCrudComponent {
    model: any = {};
    updateProject: any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private projectService: ProjectService,
        private mainService: MainService,
        private helperService: HelperService) {
        this.model.name = '';
        this.updateProject = params.get('project');
        if (this.updateProject != undefined) {
            this.model.name = this.updateProject.name;
            this.model.projectID = this.updateProject.projectID;
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    send(form: any) {
        if (form.valid) {
            if (this.updateProject != undefined) {
                this.projectService.update(this.model).subscribe(data => {
                    this.updateProject.projectID = this.model.projectID;
                    this.updateProject.name = this.model.name;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.helperService.alert(message.message);
                    }
                    this.dismiss();
                });
            } else {
                this.projectService.add(this.model).subscribe(data => {
                    this.mainService.bindProjects();
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.helperService.alert(message.message);
                    }
                    this.dismiss();
                });
            }
        }
    }
}