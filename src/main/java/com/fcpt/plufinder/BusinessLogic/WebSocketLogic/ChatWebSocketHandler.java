package com.fcpt.plufinder.BusinessLogic.WebSocketLogic;


import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.net.InetSocketAddress;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.io.IOException;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {
    private final UserRegistry userRegistry = new UserRegistry();
    private final ConcurrentHashMap<String, Set<WebSocketSession>> storeRooms = new ConcurrentHashMap<>();

    public ChatWebSocketHandler() {
        userRegistry.loadFromFile(); // Load user registry on startup
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        if (remoteAddress == null) {
            System.out.println("Connection failed: Remote address is null.");
            session.sendMessage(new TextMessage("Cannot process your request. Remote address unknown."));
            session.close();
            return;
        }

        String ip = remoteAddress.getAddress().getHostAddress();
        System.out.println("New connection established from IP: " + ip);

        String username = userRegistry.getUsername(ip);
        if (username.equals("Guest")) {
            System.out.println("New user detected. Prompting for registration.");
            session.sendMessage(new TextMessage("Welcome! Please register by providing a username, store ID, and initial department. Use the command:\n/register <username> <store> <department>"));
            return;
        }

        // Check if the user is pending admin approval
        if (userRegistry.isPendingApproval(ip)) {
            System.out.println("User " + ip + " is awaiting admin approval.");
            session.sendMessage(new TextMessage("Your username is awaiting admin approval. You cannot post messages until approval."));
            return;
        }

        // User is approved; retrieve store and departments
        String store = userRegistry.getStore(ip);
        if (store == null) {
            System.out.println("Error: Store information missing for IP: " + ip);
            session.sendMessage(new TextMessage("Error: Store information missing. Please re-register or contact admin."));
            return;
        }

        Set<String> departments = userRegistry.getDepartments(ip);
        if (departments == null || departments.isEmpty()) {
            System.out.println("Error: No departments assigned for IP: " + ip);
            session.sendMessage(new TextMessage("Error: No departments assigned. Please contact admin for assistance."));
            return;
        }

        // Add the user's session to each department they belong to
        for (String department : departments) {
            String roomKey = store + "-" + department;

            // Ensure the room exists
            storeRooms.putIfAbsent(roomKey, ConcurrentHashMap.newKeySet());

            // Add the session to the appropriate room
            storeRooms.get(roomKey).add(session);
            System.out.println("Added session " + session.getId() + " to room: " + roomKey);
        }

        System.out.println("Returning user connected. Username: " + username + ", Store: " + store + ", Departments: " + departments);
        session.sendMessage(new TextMessage("Welcome back, " + username + "! You are in Store: " + store + " with access to: " + departments));
    }


    @Override
    protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        InetSocketAddress remoteAddress = session.getRemoteAddress();
        String ip = (remoteAddress != null) ? remoteAddress.getAddress().getHostAddress() : "Unknown IP";
        String payload = message.getPayload();

        System.out.println("Received message from IP: " + ip + " - Payload: " + payload);

        // Track admin session state using a session attribute
        Boolean isAdminMode = (Boolean) session.getAttributes().getOrDefault("isAdminMode", false);

        // Handle entering admin mode
        if (payload.startsWith("/admin")) {
            String[] parts = payload.split(" ");
            if (parts.length > 1 && userRegistry.isAdmin(parts[1])) {
                session.getAttributes().put("isAdminMode", true); // Set admin mode to true
                session.sendMessage(new TextMessage("Admin privileges granted. Use /approve <IP>, /decline <IP>, or /logout to exit admin mode."));

                // Display pending users upon entering admin mode
                List<String> pendingUsers = userRegistry.getPendingUsers();
                if (pendingUsers.isEmpty()) {
                    session.sendMessage(new TextMessage("No users awaiting admin approval."));
                } else {
                    session.sendMessage(new TextMessage("Pending Users for Approval:\n" + String.join("\n", pendingUsers)));
                }
            } else {
                session.sendMessage(new TextMessage("Invalid admin password."));
            }
            return;
        }

        // Handle admin commands when in admin mode
        if (isAdminMode) {
            if (payload.startsWith("/approve")) {
                String targetIp = payload.substring(9).trim();
                if (userRegistry.approveUsername(targetIp)) {
                    System.out.println("Admin approved username for IP: " + targetIp);
                    session.sendMessage(new TextMessage("Username approved for IP: " + targetIp));
                } else {
                    System.out.println("Admin failed to approve username for IP: " + targetIp);
                    session.sendMessage(new TextMessage("Failed to approve username for IP: " + targetIp));
                }
                return;
            }

            if (payload.startsWith("/decline")) {
                String targetIp = payload.substring(9).trim();
                userRegistry.declineUsername(targetIp);
                System.out.println("Admin declined username for IP: " + targetIp);
                session.sendMessage(new TextMessage("Username declined for IP: " + targetIp));
                return;
            }

            if (payload.equals("/logout")) {
                session.getAttributes().put("isAdminMode", false); // Exit admin mode
                System.out.println("Admin logged out.");
                session.sendMessage(new TextMessage("Exited admin mode."));
                return;
            }

            session.sendMessage(new TextMessage("Unrecognized admin command. Use /approve <IP>, /decline <IP>, or /logout to exit admin mode."));
            return;
        }

        // Handle registration
        if (payload.startsWith("/register ")) {
            System.out.println("Processing /register command for IP: " + ip);

            String[] parts = payload.split(" ");
            if (parts.length == 4) {
                String desiredUsername = parts[1];
                String store = parts[2];
                String department = parts[3];

                if (userRegistry.isPendingApproval(ip)) {
                    System.out.println("User " + ip + " is already awaiting admin approval.");
                    session.sendMessage(new TextMessage("Your username is already awaiting admin approval. Please wait for confirmation."));
                    return;
                }

                userRegistry.addPendingUsername(ip, desiredUsername, store, department);
                System.out.println("User " + ip + " has been added to the pending list.");
                session.sendMessage(new TextMessage("Thank you for registering! Your username is awaiting admin approval."));
            } else {
                System.out.println("Invalid /register command format from IP: " + ip);
                session.sendMessage(new TextMessage("Invalid registration format. Use: /register <username> <store> <department>."));
            }
            return;
        }

        // Restrict users pending admin approval from sending messages
        if (userRegistry.isPendingApproval(ip)) {
            session.sendMessage(new TextMessage("Your username is still awaiting admin approval. You cannot post messages."));
            return;
        }

        // Handle sending a message for approved users
        if (payload.startsWith("/message ")) {
            String messageContent = payload.substring(9).trim();
            String store = userRegistry.getStore(ip);
            String username = userRegistry.getUsername(ip);
            Set<String> departments = userRegistry.getDepartments(ip);

            // Check if the user is associated with a valid store and department
            if (store == null || departments.isEmpty()) {
                System.out.println("Message failed. User is not associated with a valid store or department. IP: " + ip);
                session.sendMessage(new TextMessage("You are not associated with a store or department. Cannot send message."));
                return;
            }

            // Broadcast to all departments the user is part of
            for (String department : departments) {
                String roomKey = store + "-" + department;
                if (!storeRooms.containsKey(roomKey)) {
                    System.out.println("Room does not exist for key: " + roomKey);
                    session.sendMessage(new TextMessage("Room does not exist. Unable to send message."));
                    continue;
                }
                broadcastToRoom(roomKey, "[" + username + "]: " + messageContent);
            }

            System.out.println("Message sent by " + username + " to departments: " + departments);
        } else {
            session.sendMessage(new TextMessage("Unrecognized command."));
        }
    }

    // Separate broadcastToRoom method
    private void broadcastToRoom(String roomKey, String message) {
        if (!storeRooms.containsKey(roomKey)) {
            System.out.println("Room does not exist: " + roomKey);
            return;
        }

        // Iterate over all sessions in the room
        storeRooms.get(roomKey).forEach(session -> {
            try {
                session.sendMessage(new TextMessage(message)); // Send the message to each session
            } catch (IOException e) {
                System.out.println("Failed to send message to session: " + session.getId());
                e.printStackTrace();
            }
        });

        System.out.println("Broadcast message to room [" + roomKey + "]: " + message);
    }

}
