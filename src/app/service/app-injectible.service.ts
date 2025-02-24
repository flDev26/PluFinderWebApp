//Purpose: In this file, Http requests are defined. 
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../product';

//This "injectable" service will be used by multiple components within this project.
@Injectable({
  providedIn: 'root'
})

export class AppInjectibleService {
  //Variable used by the front end, to make Http requests.
  constructor(private http:HttpClient) {}

  //Variables holding Urls from the back end services.
  //***FOR TESTING LOCALLY****
  //private hostURL="http://localhost:8080/api/v1/products_indatabase";
  //private imagesURL="http://localhost:8080/api/v1/images";
  //private videosURL="http://localhost:8080/api/v1/videos";

  //***AWS EC2 INSTANCE***
  private hostURL="http://ec2-3-129-194-7.us-east-2.compute.amazonaws.com:8080/api/v1/products_indatabase";
  private imagesURL="http://ec2-3-129-194-7.us-east-2.compute.amazonaws.com:8080/api/v1/images";
  private videosURL="http://ec2-3-129-194-7.us-east-2.compute.amazonaws.com:8080/api/v1/videos";

  //The "Observable" class helps create/recieve requests from the frontend side of the application.
  //The API requests used in this project are "POST", "GET", "PUT", and "DELETE". 
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //GET:Grabs all database entries.
  GetAllProductsFromDb():Observable<Product[]>{
    return this.http.get<Product[]>(`${this.hostURL}`);
  }

  //GET:Grab entries containing "productName" string.
  GetProductsWithNameFromDb(productName:string):Observable<Product[]>{
    return this.http.get<Product[]>(`${this.hostURL}/search`,{params:{productName:productName}});
  }

  //GET:Grab filtered entries contaning any substring.   
  GetFileteredProductsFromDb(query:string,department:string):Observable<Product[]>{
    let params=new HttpParams().set('query',query); //Assign a parameter
    if(department){params = params.set('department',department);} //Assign second parameter

    return this.http.get<Product[]>(`${this.hostURL}/filteredSearch`,{params:params});
  }

  //GET:Get entriesntries with a matching first "category" entry and matching "department".
  GetFirstCategoryFromDb(query:string,department:string):Observable<Product[]>{
    return this.http.get<Product[]>(`${this.hostURL}/filteredSearchByFirstCategory`,{params:{query:query,department:department}});
  }

  //GET:Get "Market" entries with a matching second "category" entry.
  GetMarketSecondCategoryFromDb(query:string):Observable<Product[]>{
    return this.http.get<Product[]>(`${this.hostURL}/filteredSearchByMarketSecondCategory`,{params:{query:query}});
  }

  //GET:Grab one image from the backend storage.
  GetOneMainImage(imageFileName:string):Observable<Blob>{
    return this.http.get(`${this.imagesURL}/${imageFileName}`,{responseType:'blob'});
  }

  //GET:Grab one image from the backend storage.
  GetOneVideo(vidoeFileName:string):Observable<Blob>{
    return this.http.get(`${this.videosURL}/${vidoeFileName}`,{responseType:'blob'});
  }
}
