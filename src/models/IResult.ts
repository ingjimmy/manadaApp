export interface IResult {
    hasNextPage:boolean;
    hasPreviousPage:boolean;
    pageIndex:number;
    results:Array<any>;
    totalCount:number;
}