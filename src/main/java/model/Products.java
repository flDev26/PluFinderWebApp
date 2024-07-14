package model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table (name="products_inDatabase")
public class Products{
	//MAPPED CLASS VARIABLES
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;
	@Column(name="name_inDB")
	private String productName;
	@Column(name="mainImage_inDB")
    private String mainImageUrl;
	@Column(name="price_inDB")
    private long priceInCents;
	@Column(name="unit_inDB")
    private String unit;
	@Column(name="plu_inDB")
	private int plu;
	@Column(name="department_inDB")
	private String department;
	@Column(name="category_inDB")
    private String category;
	@Column(name="description_inDB")
    private String description;
    
    //CLASS CONSTRUCTORS
    public Products(){}
    public Products(int id,String productName,String mainImageUrl,long priceInCents,String unit,int plu,
			String department,String category,String description){
		this.id=id;
		this.productName=productName;
		this.mainImageUrl=mainImageUrl;
		this.priceInCents=priceInCents;
		this.unit=unit;
		this.plu=plu;
		this.department=department;
		this.category=category;
		this.description=description;
	}
   
	//CLASS VARIABLE SETTERS AND GETTERS
	public int getId(){
		return id;
	}
	public void setId(int id){
		this.id=id;
	}
	public String getProductName(){
		return productName;
	}
	public void setProductName(String productName){
		this.productName=productName;
	}
	public String getImageUrl(){
		return mainImageUrl;
	}
	public void setImageUrl(String mainImageUrl){
		this.mainImageUrl=mainImageUrl;
	}
	public long getPriceInCents(){
		return priceInCents;
	}
	public void setPriceInCents(long priceInCents){
		this.priceInCents=priceInCents;
	}
	public String getUnit(){
		return unit;
	}
	public void setUnit(String unit){
		this.unit=unit;
	}
	public int getPlu(){
		return plu;
	}
	public void setPlu(int plu){
		this.plu=plu;
	}
	public String getDepartment(){
		return department;
	}
	public void setDepartment(String department){
		this.department=department;
	}
	public String getCategory(){
		return category;
	}
	public void setCategory(String category){
		this.category=category;
	}
	public String getDescription(){
		return description;
	}
	public void setDescription(String description){
		this.description=description;
	}	
}





