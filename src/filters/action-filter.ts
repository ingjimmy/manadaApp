export class ActionFilter {
    status:string;
    projectID?:number;
    page:number;
    hasNextPage:boolean = false;  
    searchCriteria:string = '';  
    userID?:number;
    getAll:boolean = false;
}