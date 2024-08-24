// Typescript class. Created to help refer to database entries, columns, etc. Class
// variable names here should match the variable names of the "Product" class used in
// the backend. Class definition must be initialized to avert compilation errors like
// done below.
export class Product {
    id:number=0;
    productName:string='';
    imageFileName:string='';
    priceInCents:number=0;
    unit:string='';
    plu:number=0;
    department:string='';
    category:string='';
    description:string='';

    imageUrl?:string;  //Exists only in front end. Optional variable.
}
