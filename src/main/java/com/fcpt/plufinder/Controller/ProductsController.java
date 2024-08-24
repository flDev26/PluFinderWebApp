package com.fcpt.plufinder.Controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.fcpt.plufinder.BusinessLogic.ImageServiceLogic;
import com.fcpt.plufinder.BusinessLogic.ProductRepoLogic;
import com.fcpt.plufinder.Exeptions.ResourceNotFound;
import com.fcpt.plufinder.Model.Product;


// The Angular application runs on "http://localhost:4200" and makes requests to this API
// at "http://localhost:8080", the CORS web browser policy would complain if the
// front-end made a request to a domain different to the one it stands on. The annotation
// here fixes this discrepancy.
@CrossOrigin(origins = "http://localhost:4200")

// RESTful API controller properties are defined here. CRUD(Create,Read,Update,Delete)
// operations are the 4 motions used to handle a database. These 4 operations are
// possible with the HTTP methods: POST, GET, PUT, and DELETE. 
@RestController
@RequestMapping("/api/v1/")
public class ProductsController{
    @Autowired
    private ProductRepoLogic jpaFuncVar;
    @Autowired
    private ImageServiceLogic imgServVar;

    //GET request: Grab all table entries.
    @GetMapping("/products_indatabase")
    public List<Product> getAllProductsFromDb(){
        // Function "findAll()" is part of the JpaRepository interface.   	
        return jpaFuncVar.findAll();
    }

    //POST request: Create a new table entry.
    @PostMapping("/products_indatabase")
    public Product createNewProductInDb(@RequestBody Product productClassVar){
    	return jpaFuncVar.save(productClassVar);
    }

    //GET request: Grab one table entry based on "productName".   
    @GetMapping("/products_indatabase/{productName}")
    public ResponseEntity<Product> getOneProductFromDb(@PathVariable String productName){
    	// In case of invalid "productName", an exception handler prints an error message. 
    	Product productClassVar=jpaFuncVar.findByProductName(productName).orElseThrow(()->
    	new ResourceNotFound("Product does not exist with name: "+productName)); 
    	
    	return ResponseEntity.ok(productClassVar);
    }

    //GET request: Grab one image.
    @GetMapping("/images/{fileName}")
    public ResponseEntity<Resource>getOneMainImage(@PathVariable("fileName") String fileName){
        //Full image path.
        Resource storagePath=imgServVar.loadaMainImage(fileName);
        //Instruct the image to reveal itself on screen.
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE,"image/jpeg").body(storagePath);
    }
    
}