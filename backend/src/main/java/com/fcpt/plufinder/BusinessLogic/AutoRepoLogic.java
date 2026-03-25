package com.fcpt.plufinder.BusinessLogic;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;


import com.fcpt.plufinder.Model.Product;

public interface AutoRepoLogic extends JpaRepository<Product,Integer>{
	//The "@Repository" annotations allows for use of the "JpaRepository" interface. This grants
    //the convenience of not needing to write any hard-coded SQL logic which would then be used by
    //the "ProductsController" for its managment of HTTP requests. The interface takes our defined
    //"Products" class as an argument, thus having access to our defined database mappings.
	
    //Below methods take advantage of Spring Data JPA's automatic SQL query generation based on the
    //literal method name. These methods are then used by the "ProductsController".
    List<Product>findByProductNameContaining(String productName);
}
