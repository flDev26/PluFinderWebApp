package com.fcpt.plufinder.BusinessLogic;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fcpt.plufinder.Model.Product;

public interface ProductRepoLogic extends JpaRepository<Product,Integer>{
	//The "@Repository" annotations allows for use of the "JpaRepository" interface. This grants
    //the convenience of not needing to write any hard-coded SQL logic which would then be used by
    //the "ProductsController" for its managment of HTTP requests. One can see that the interface
    //takes our defined "Products" class as an argument, thus having access to our defined database
    //mappings.
	
    //Find a product by name. Jpa will automatically generate the SQL query based on the method
    //name. There is no built in method within the Jpa interface for finding a poduct by name, so
    //a custom method is named.
    Optional<Product> findByProductName(String productName);
}
