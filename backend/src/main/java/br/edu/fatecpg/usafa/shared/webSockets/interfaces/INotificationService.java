package br.edu.fatecpg.usafa.shared.webSockets.interfaces;

public interface INotificationService {
    <T> void send(String userPublicId, String type, T payload);
    <T> void send(String userPublicId, String type, String message, T payload);
}