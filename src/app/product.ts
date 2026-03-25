// Typescript class. Created to help refer to database entries, columns, etc. Class
// variable names here should match the variable names of the "Product" class used in
// the backend. Class definition must be initialized to avert compilation errors like
// done below.
export interface Product {
    id:number;
    productName:string;
    imageFileName:string;
    priceInCents:number;
    unit:string;
    plu:number;
    department:string;
    category:string;
    description:string;

    imageUrl?:string;  //Exists only in front end. Optional variable.
}
