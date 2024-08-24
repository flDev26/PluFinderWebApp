package com.fcpt.plufinder.BusinessLogic;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;



@Service
public class ImageServiceLogic {
    //Variable holding folder path to main image of every product.
    private final Path mainImagePath=Paths.get("src/main/resources/MainPictures");

    public Resource loadaMainImage(String givenImageName){
        try {
            Path file=mainImagePath.resolve(givenImageName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file!");
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not read the file!", e);
        }
    }
}
