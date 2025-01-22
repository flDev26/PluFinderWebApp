package com.fcpt.plufinder.BusinessLogic;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.fcpt.plufinder.Model.Product;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;

@Repository
public class CustomRepoLogic implements CustomMethods{
    
    @PersistenceContext
    //Variable to help finalize cosntructed query.
    private EntityManager entityManager;

    @Override
    public List<Product>queryByNameCategoryDepartment(String[] substrings,String department){
        //Variable for dynamic SQL query construction.
        StringBuilder queryBuilder=new StringBuilder("SELECT p, ");//"p" defined later in query

        //Relevance calculation loop. "p" columns "productName" and "category" are traversed for every
        //"substrings" element present. The "substrings" element is then rated with a 1 or 0.
        for(int i=0;i<substrings.length;i++){
            if(i>0){queryBuilder.append(" + ");}
            queryBuilder.append("(CASE WHEN LOWER(p.productName) LIKE :substring").append(i)
                        .append(" OR LOWER(p.category) LIKE :substring").append(i)
                        .append(" THEN 1 ELSE 0 END)");
        }

        //Conditional loop. Previously rated substrings with a 1 are matched to "p's" table entries.
        //Table entries that have the most substrings with 1's are among the first search results.
        queryBuilder.append(" AS relevance FROM Product p WHERE (");
        for(int i=0;i<substrings.length;i++){
            if(i>0){queryBuilder.append(" OR ");}
            queryBuilder.append("LOWER(p.productName) LIKE :substring").append(i)
                        .append(" OR LOWER(p.category) LIKE :substring").append(i);
        }
        queryBuilder.append(")");

        //Department parameter. Restricts search to only entries belonging to specific department. 
        if(department!=null&&!department.trim().isEmpty()){
            queryBuilder.append(" AND LOWER(p.department) LIKE :department");
        }
        queryBuilder.append(" ORDER BY relevance DESC");

        //Debug statment of auto constructed query.
        System.out.println("(in Mthd)Constructed Query: "+queryBuilder.toString());

        //Mark built query stored in "queryBuilder" as official SQL command. For this case, there's
        //no need for complicated SQL functions, so we may use JPA entity field names instead of the
        //actual database table column names.
        TypedQuery<Object[]>query=entityManager.createQuery(queryBuilder.toString(),Object[].class);

        //Debug statment. All initial substrings are now searched within "query".
        for(int i=0;i<substrings.length;i++){
            query.setParameter("substring"+i,"%"+substrings[i].trim().toLowerCase()+"%");
            System.out.println("(in Mthd)Parameter substring"+i+": "+substrings[i].trim().toLowerCase());
        }
        //Debug statement. The optional inital department string is searched within "query".
        if (department!=null&&!department.trim().isEmpty()){
            query.setParameter("department","%"+department.trim().toLowerCase()+"%");
            System.out.println("(in Mthd)Parameter department: "+department.trim().toLowerCase());
        }

        //Query is executed.
        List<Object[]>results=query.getResultList();
        //Results are mapped to "Product" class entities.
        return results.stream().map(result->(Product)result[0]).toList();
    }
    
    @Override
    public List<Product> queryByMarketFirstCategory(String[] categorySubstrings){
        //Construct native query.
        StringBuilder queryBuilder=new StringBuilder("SELECT * FROM products_indatabase p WHERE(");
        
        //Add category conditions to match any of the first comma-delimited substrings.
        for(int i=0;i<categorySubstrings.length;i++){
            if(i>0){queryBuilder.append(" OR ");}
            queryBuilder.append("LOWER(SUBSTRING_INDEX(p.category_in_db, ',', 1)) LIKE :categorySubstring").append(i);
        }
        queryBuilder.append(") AND LOWER(p.department_in_db) = 'Market'");
    
        //Debug statement.
        System.out.println("(in Mthd)Constructed Query: "+queryBuilder.toString());
    
        //Mark "natvQuery" as official SQL command. Due to our desired use of "SUBSTRING_INDEX()" 
        //within our SQL here, exact column names must be used to use this kind of SQL function. 
        Query natvQuery=entityManager.createNativeQuery(queryBuilder.toString(), Product.class);
    
        //Isolation and preparation of substrings happens before printing of debug statement.
        for(int i=0;i<categorySubstrings.length;i++){
            natvQuery.setParameter("categorySubstring"+i,"%"+categorySubstrings[i].trim().toLowerCase()+"%");
            System.out.println("(in Mthd)Parameter categorySubstring"+i+": "+categorySubstrings[i].trim().toLowerCase());
        }
    
        //Execute native query and cast results to Product. 
        @SuppressWarnings("unchecked") 
        List<Product>results=natvQuery.getResultList(); 
        return results;
    }
    
    @Override
    public List<Product> queryByMarketSecondCategory(String[] categorySubstrings){
        //Construct native SQL query.
        StringBuilder queryBuilder=new StringBuilder("SELECT * FROM products_indatabase p WHERE (");
        
        //Add category conditions to isolate the second comma-delimited element.
        for(int i=0;i<categorySubstrings.length;i++){
            if(i>0){queryBuilder.append(" OR ");}
            queryBuilder.append("LOWER(SUBSTRING_INDEX(SUBSTRING_INDEX(p.category_in_db, ',', 2), ',', -1)) LIKE :categorySubstring").append(i);
        }
        queryBuilder.append(") AND LOWER(p.department_in_db) = 'Market'");

        //Debug statement.
        System.out.println("Constructed Query: "+queryBuilder.toString());

        //Make the native query official.
        Query query=entityManager.createNativeQuery(queryBuilder.toString(), Product.class);

        //Isolation and preparation of substrings happens before printing of debug statement.
        for(int i=0;i<categorySubstrings.length;i++){
            query.setParameter("categorySubstring"+i,"%"+categorySubstrings[i].trim().toLowerCase()+"%");
            System.out.println("Parameter categorySubstring"+i+": "+categorySubstrings[i].trim().toLowerCase());
        }

        //Execute query and cast results to "Product" data type.
        @SuppressWarnings("unchecked")
        List<Product>results=query.getResultList();
        return results;
    }

}