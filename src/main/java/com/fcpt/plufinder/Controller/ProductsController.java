package com.fcpt.plufinder.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fcpt.plufinder.BusinessLogic.ProductRepoLogic;
import com.fcpt.plufinder.Exeptions.ResourceNotFound;
import com.fcpt.plufinder.Model.Product;

@RestController
@RequestMapping("/api/v1/")
public class ProductsController{
    @Autowired
    private ProductRepoLogic jpaFuncVar;

    // GET request: Grab all table entries.
    @GetMapping("/products_indatabase")
    public List<Product> getAllProductsFromDb(){
        // Function "findAll()" is part of the JpaRepository interface.   	
        return jpaFuncVar.findAll();
    }

    // POST request: Create a new table entry.
    @PostMapping("/products_indatabase")
    public Product createNewProductInDb(@RequestBody Product productClassVar) {
    	return jpaFuncVar.save(productClassVar);
    }

    // GET request: Grab one table entry based on "productName".   
    @GetMapping("/products_indatabase/{productName}")
    public ResponseEntity<Product> getOneProductFromDb(@PathVariable String productName){
    	// In case of invalid "productName", an exception handler prints an error message. 
    	Product productClassVar=jpaFuncVar.findByProductName(productName).orElseThrow(()->
    	new ResourceNotFound("Product does not exist with name: "+productName)); 
    	
    	return ResponseEntity.ok(productClassVar);
    }
}