import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";
import { ProjectService, MainService } from "../../services/index";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
    templateUrl: 'project-crud.html'
})
export class ProjectCrudComponent {
    public model: any = {};
    public updateProject: any;
    public isBusy:boolean = false;
    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private projectService: ProjectService,
        private mainService: MainService,
        private alertHelper: AlertHelper) {
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
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            } else {
                this.projectService.add(this.model).subscribe(data => {
                    this.mainService.bindProjects();
                    this.isBusy = false;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            }
        }
    }
}