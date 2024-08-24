//Purpose: In this file, Http requests are defined. 
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from './product';

//This "injectable" service will be used by multiple components within this project.
@Injectable({
  providedIn: 'root'
})

export class AppInjectibleService {
  //Variable used by the front end, to make Http requests.
  constructor(private http:HttpClient) {}

  //Variables holding Urls from the back end services.
  private hostURL="http://localhost:8080/api/v1/products_indatabase";
  private imagesURL="http://localhost:8080/api/v1/images";

  //Hold search box input. Global via observable.
  private givenInput=new BehaviorSubject<string>("");
  obsrGivenInput$=this.givenInput.asObservable();
  //Holds filtered search box results. Global via observable.
  public searchResults=new BehaviorSubject<Product[]>([]);
  obsrSearchResults$=this.searchResults.asObservable();

  products:Product[]=[];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  private dataReadySubject = new BehaviorSubject<boolean>(false);
  dataReady$ = this.dataReadySubject.asObservable();
  
  loadProducts(): void {
    this.GetAllProductsFromDb().subscribe(
      (products: Product[]) => {
        this.products = products;
        this.productsSubject.next(this.products);
        this.dataReadySubject.next(true); // Notify that data is ready
        console.log("INJECT-Products fetched:", this.products);
      },
      error => {
        console.error('INJECT-Error fetching products:', error);
      }
    );
  }

  //ServiceMethod:Captures new search box input. Calls "searchProducts()"
  updateSearchTerm(term: string): void {
    this.givenInput.next(term);
    const results = this.searchProducts(term);
    this.searchResults.next(results);
  }

  //ServiceMethod: Filters Products given "searchTerm".
  searchProducts(searchTerm: string): Product[] {
    if (searchTerm) {
      return this.products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return [];
    }
  }

  //The "Observable" class helps create/recieve requests from the frontend side of the application.
  //The API requests used in this project are "POST", "GET", "PUT", and "DELETE". 
  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  //GET: Grabs all database entries.
  GetAllProductsFromDb():Observable<Product[]>{
    return this.http.get<Product[]>(`${this.hostURL}`);
  }

  //GET: Grab one database entry by product name.
  GetOneProductFromDb(productName:string):Observable<Product>{
    return this.http.get<Product>(`${this.hostURL}/${productName}`);
  }

  //GET: Grab one image from the backend storage.
  GetOneMainImage(imageFileName:string):Observable<Blob>{
    return this.http.get(`${this.imagesURL}/${imageFileName}`,{responseType:'blob'});
  }
}
