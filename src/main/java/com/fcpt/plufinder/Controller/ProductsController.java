package com.fcpt.plufinder.Controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fcpt.plufinder.BusinessLogic.CustomRepoLogic;
import com.fcpt.plufinder.BusinessLogic.CustomResourceLogic;
import com.fcpt.plufinder.BusinessLogic.AutoRepoLogic;
import com.fcpt.plufinder.Exeptions.ResourceNotFound;
import com.fcpt.plufinder.Model.Product;


// The Angular application runs on "http://localhost:4200" and makes requests to this API
// at "http://localhost:8080", the CORS web browser policy would complain if the
// front-end made a request to a domain different to the one it stands on. The annotation
// here fixes this discrepancy.
//****TESTING LOCALLY****
@CrossOrigin(origins = "http://localhost:4200")

//****AWS INSTANCE****
//@CrossOrigin(origins = "http://plufinder-s3.s3-website.us-east-2.amazonaws.com")

// RESTful API controller properties are defined here. CRUD(Create,Read,Update,Delete)
// operations are the 4 motions used to handle a database. These 4 operations are
// possible with the HTTP methods: POST, GET, PUT, and DELETE. 
@RestController
@RequestMapping("/api/v1/")
public class ProductsController{
    @Autowired
    private AutoRepoLogic jpaAutoQuery;
    @Autowired
    private CustomRepoLogic customQuery;
    @Autowired
    private CustomResourceLogic imgServVar;
    @Autowired
    private CustomResourceLogic videoServVar;

    //GET request: Grab all table entries.
    @GetMapping("/products_indatabase")
    public List<Product> getAllProductsFromDb(){
        // Function "findAll()" is part of the JpaRepository interface.   	
        return jpaAutoQuery.findAll();
    }

    //POST request: Create a new table entry.
    @PostMapping("/products_indatabase")
    public Product createNewProductInDb(@RequestBody Product productClassVar){
    	return jpaAutoQuery.save(productClassVar);
    }

    //GET request: Grab table entries that contain "productName" string.   
    @GetMapping("/products_indatabase/search")
    public ResponseEntity<List<Product>> getProductsWithNameFromDb(@RequestParam("productName") String productName){
    	List<Product> productClassVar=jpaAutoQuery.findByProductNameContaining(productName);
        System.out.println("Found products: " + productClassVar);
        //In case of invalid "productName", an exception handler prints an error message. 
        if(productClassVar.isEmpty()){
            throw new ResourceNotFound("No products found with name: " + productName);
        }
        return ResponseEntity.ok(productClassVar);
    }

    //GET request: Grabs table entries based on given string parameters.
    @GetMapping("/products_indatabase/filteredSearch")
    public ResponseEntity<List<Product>> getFilteredProductsFromDb(
        @RequestParam("query") String query,
        @RequestParam(value="department",required=false) String department){
        
        //Split the query into substrings
        String[]substrings=query.split(" ");

        //Debugging: Print the substrings and department.
        System.out.println("Substrings: "+Arrays.toString(substrings));
        System.out.println("Department: "+department);
        
        //Search for products containing any of the substrings in productName or category, and matching the department.
        List<Product>productClassVar=customQuery.queryByNameCategoryDepartment(substrings,department);
        
        System.out.println("Found products: "+productClassVar);
        if(productClassVar.isEmpty()){
            return ResponseEntity.ok(productClassVar); //Return an empty array.
        }
        return ResponseEntity.ok(productClassVar);
    }

    @GetMapping("/products_indatabase/filteredSearchByFirstCategory")
    public ResponseEntity<List<Product>> getFilteredProductsByFirstCategory(
        @RequestParam("query") String query,
        @RequestParam(value="department",required=false) String department){
        
        //Split the query into substrings.
        String[]categorySubstrings=query.split(" ");
        
        //Debugging: Print the category substrings.
        System.out.println("(in Get)Category Substrings: "+Arrays.toString(categorySubstrings));
        System.out.println("Department: "+department);
        
        //Search for products matching the first comma-delimited substring in category and belonging given "department".
        List<Product>productClassVar=customQuery.queryByFirstCategory(categorySubstrings,department);
        
        if(productClassVar.isEmpty()){
            System.out.println("(in Get)Empty array.");
            return ResponseEntity.ok(productClassVar); //Return an empty array
        }
        return ResponseEntity.ok(productClassVar);
    }

    @GetMapping("/products_indatabase/filteredSearchByMarketSecondCategory")
    public ResponseEntity<List<Product>> getFilteredProductsByMarketSecondCategory(
        @RequestParam("query") String query){
        
        //Split the query into substrings.
        String[]categorySubstrings=query.split(" ");
        System.out.println("Category Substrings: "+Arrays.toString(categorySubstrings));
        
        //Execute custom query.
        List<Product>productClassVar=customQuery.queryByMarketSecondCategory(categorySubstrings);
        
        System.out.println("Found products: "+productClassVar);
        if(productClassVar.isEmpty()){
            return ResponseEntity.ok(productClassVar); //Return an empty array
        }
        return ResponseEntity.ok(productClassVar);
    }

    //GET request: Grab one image.
    @GetMapping("/images/{fileName}")
    public ResponseEntity<Resource> getOneMainImage(@PathVariable("fileName") String fileName){
        //Full image path.
        Resource storagePath=imgServVar.loadaMainImage(fileName);
        //Instruct the image to reveal itself on screen.
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE,"image/jpeg").body(storagePath);
    }
    
    //GET request: Grab one video.
    @GetMapping("/videos/{fileName}")
    public ResponseEntity<Resource> getOneVideo(@PathVariable("fileName") String fileName) {
        //Load the video file from the service.
        Resource storagePath= videoServVar.loadaVideo(fileName);

        //Return the video with appropriate headers.
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "video/mp4")
                .body(storagePath);
    }

}