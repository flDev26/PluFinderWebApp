package com.fcpt.plufinder.BusinessLogic;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;



@Service
public class CustomResourceLogic{
    //***LOCAL TESTING***
    //Variable holding folder path to main image of every product.
    private final Path mainImagePath=Paths.get("./src/main/resources/MainPictures");
    //Variable holding video storage directory.
    private final Path videoFilePath=Paths.get("./src/main/resources/Videos");

    //Method to fetch image.
    public Resource loadaMainImage(String givenImageName){
        try{
            Path file=mainImagePath.resolve(givenImageName);
            Resource resource=new UrlResource(file.toUri());
            if (resource.exists()||resource.isReadable()){
                return resource;
            } else {
                throw new RuntimeException("Could not read image file!");
            }
        }catch(Exception e){
            throw new RuntimeException("Could not read image file!",e);
        }
    }

    //Method to fetch video.
    public Resource loadaVideo(String fileName){
        try{
            //Resolve the file path.
            Path filePath=videoFilePath.resolve(fileName).normalize();
            Resource resource=new UrlResource(filePath.toUri());

            //Check if the file exists and is readable.
            if(resource.exists()||resource.isReadable()){
                return resource;
            }else{
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Video file not found: "+fileName);
            }
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Could not read video file: "+fileName,e);
        }
    }    

    /***EC2 INSTANCE***
    //Variable holding path no longer needed.
    @Autowired
    private ResourceLoader resourceInCompressedJAR;

    //Method to fetch image from classpath.
    public Resource loadaMainImage(String givenImageName){
        try{
            //Load the image as a classpath resource
            Resource resource=resourceInCompressedJAR.getResource("classpath:MainPictures/"+givenImageName);

            if(resource.exists()||resource.isReadable()){
                return resource;
            }else{
                throw new RuntimeException("Could not read image file: "+givenImageName);
            }
        }catch(Exception e){
            throw new RuntimeException("Could not read image file: "+givenImageName,e);
        }
    }
    
    //Method to fetch video.
    public Resource loadaVideo(String fileName){
        try{
            //Load the image as a classpath resource
            Resource resource=resourceInCompressedJAR.getResource("classpath:Videos/"+fileName);

            //Check if the file exists and is readable.
            if(resource.exists()||resource.isReadable()){
                return resource;
            }else{
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Video file not found: "+fileName);
            }
        }catch(Exception e){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Could not read video file: "+fileName,e);
        }
    }*/   
    
}
