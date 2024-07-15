package Controller;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Model.Products;

@Repository
public interface ProductsController extends JpaRepository<Products,Integer>{
	//The "@Repository" annotations allows for use of the "JpaRepository" interface. This grants
    //the convenience of not needing to write any hard-coded SQL logic witch would then be used by
    //the "ProductsController" for its managment of HTTP requests. One can see that the interface
    //takes our defined "Products" class as an argument, thus having access to our defined database
    //mappings.
	
}