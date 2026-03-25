package com.fcpt.plufinder.BusinessLogic.WebSocketLogic;

import com.fcpt.plufinder.Model.UserData;
import java.io.*;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class UserRegistry {
    private static final String FILE_PATH = "usersInChatList.dat"; // Persistence file
    private static final String ADMIN_PASSWORD = "admin_privileges_"; // Admin password
    private ConcurrentHashMap<String, UserData> ipToUserData = new ConcurrentHashMap<>();
    private ConcurrentHashMap<String, String> pendingUsernames = new ConcurrentHashMap<>(); // Pending usernames for admin approval
    private ConcurrentHashMap<String, Set<String>> storeToDepartments = new ConcurrentHashMap<>(); // Store to departments mapping
    private static final int INACTIVITY_DAYS_LIMIT = 14;

    // Load data from file
    public void loadFromFile() {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_PATH))) {
            Object obj = ois.readObject();
            if (obj instanceof ConcurrentHashMap<?, ?>) {
                ipToUserData = (ConcurrentHashMap<String, UserData>) obj; // Safe cast
                System.out.println("Loaded user data from file.");
            } else {
                System.out.println("Data file format is invalid.");
                ipToUserData = new ConcurrentHashMap<>(); // Initialize fresh map
            }
        } catch (IOException | ClassNotFoundException e) {
            System.out.println("No previous user data found. Starting fresh.");
        }
    }

    // Save data to file
    public void saveToFile() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_PATH))) {
            oos.writeObject(ipToUserData);
            System.out.println("Saved user data to file.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Register a user with their store and initial department
    public void registerUser(String ip, String username, String store, String department) {
        ipToUserData.put(ip, new UserData(username, store, department));
        saveToFile();
    }

    // Add a username for admin approval
    public void addPendingUsername(String ip, String desiredUsername, String store, String department) {
        pendingUsernames.put(ip, desiredUsername);
        // Temporarily register the user as "Guest"
        registerUser(ip, "Guest", store, department);
        saveToFile();
    }

    // Check if a user is pending approval
    public boolean isPendingApproval(String ip) {
        return pendingUsernames.containsKey(ip);
    }

    // Get a list of pending users with their details
    public List<String> getPendingUsers() {
        List<String> pendingList = new ArrayList<>();

        for (Map.Entry<String, String> entry : pendingUsernames.entrySet()) {
            String ip = entry.getKey();
            String username = entry.getValue();
            UserData userData = ipToUserData.get(ip);

            if (userData != null) {
                String store = userData.getStore();
                Set<String> departments = userData.getDepartments();
                pendingList.add(String.format("Username: %s, IP: %s, Store: %s, Department(s): %s", 
                    username, ip, store, departments));
            }
        }
        return pendingList;
    }


    // Approve a username (admin-only)
    public boolean approveUsername(String ip) {
        if (pendingUsernames.containsKey(ip)) {
            String approvedUsername = pendingUsernames.remove(ip); // Remove from waitlist
            if (ipToUserData.containsKey(ip)) {
                UserData userData = ipToUserData.get(ip);
                userData.setUsername(approvedUsername);

                // Create new chat rooms if the store is new
                String store = userData.getStore();
                if (!storeToDepartments.containsKey(store)) {
                    initializeStoreDepartments(store);
                }

                saveToFile();
                return true;
            }
        }
        return false;
    }

    // Decline a username (admin-only)
    public void declineUsername(String ip) {
        if (pendingUsernames.containsKey(ip)) {
            pendingUsernames.remove(ip); // Remove from waitlist
            ipToUserData.remove(ip); // Remove user data completely
            saveToFile();
        }
    }

    // Initialize default departments for a new store
    public void initializeStoreDepartments(String storeId) {
        if (!storeToDepartments.containsKey(storeId)) {
            Set<String> departments = new HashSet<>();
            for (int i = 1; i <= 5; i++) {
                departments.add("Department" + i);
            }
            storeToDepartments.put(storeId, departments);
        }
    }

    // Differentiate between Admin and Regular User
    public boolean isAdmin(String password) {
        return ADMIN_PASSWORD.equals(password);
    }

    // Get the username for an IP
    public String getUsername(String ip) {
        return ipToUserData.containsKey(ip) ? ipToUserData.get(ip).getUsername() : "Guest";
    }

    // Get the store for an IP
    public String getStore(String ip) {
        return ipToUserData.containsKey(ip) ? ipToUserData.get(ip).getStore() : null;
    }

    // Get the departments (chat rooms) for an IP
    public Set<String> getDepartments(String ip) {
        return ipToUserData.containsKey(ip) ? ipToUserData.get(ip).getDepartments() : new HashSet<>();
    }

    // Add a new department for a user
    public void addDepartment(String ip, String newDepartment) {
        if (ipToUserData.containsKey(ip)) {
            ipToUserData.get(ip).addDepartment(newDepartment);
            saveToFile();
        }
    }

    // Update user activity
    public void updateUserActivity(String ip) {
        if (ipToUserData.containsKey(ip)) {
            ipToUserData.get(ip).updateLastActiveDate();
            saveToFile();
        }
    }

    // Remove users inactive for a certain number of days
    public void removeInactiveUsers() {
        LocalDate now = LocalDate.now();
        ipToUserData.entrySet().removeIf(entry ->
                entry.getValue().getLastActiveDate().isBefore(now.minusDays(INACTIVITY_DAYS_LIMIT))
        );
        saveToFile();
    }
}