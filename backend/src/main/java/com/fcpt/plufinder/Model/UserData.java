package com.fcpt.plufinder.Model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public class UserData implements Serializable {
    private String username;
    private LocalDate lastActiveDate;
    private String store;
    private Set<String> departments; // A set of departments the user can access

    public UserData(String username, String store, String department) {
        this.username = username;
        this.store = store;
        this.departments = new HashSet<>();
        this.departments.add(department);
        this.lastActiveDate = LocalDate.now();
    }

    // Getters
    public String getUsername() {
        return username;
    }

    public String getStore() {
        return store;
    }

    public Set<String> getDepartments() {
        return departments;
    }

    public LocalDate getLastActiveDate() {
        return lastActiveDate;
    }

    //Setters
    public void updateLastActiveDate() {
        this.lastActiveDate = LocalDate.now();
    }

    public void addDepartment(String department) {
        this.departments.add(department);
    }

    public void setUsername(String username) {
        this.username = username;
    }
}