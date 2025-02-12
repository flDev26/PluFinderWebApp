package com.fcpt.plufinder.BusinessLogic;

import java.util.List;
import com.fcpt.plufinder.Model.Product;

public interface CustomMethods{
    List<Product> queryByNameCategoryDepartment(String[] substrings,String department);

    List<Product> queryByFirstCategory(String[] categorySubstring,String department);

    List<Product> queryByMarketSecondCategory(String[] categorySubstring);
}

