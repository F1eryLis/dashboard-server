```mermaid
classDiagram
    class User {
        Int id
        String email
        String username
        Int? agencyId
        Int? clientId
    }

    class Agency {
        Int id
        String name
        DateTime createdAt
        DateTime updatedAt
    }

    class Client {
        Int id
        String name
        String email
        String phone
        DateTime createdAt
        DateTime updatedAt
        Int? userId
    }

    class Order {
        Int id
        String status
        String details
        DateTime createdAt
        DateTime updatedAt
        Int clientId
        Int agencyId
    }

    class Role {
        Int id
        String name
    }

    class Permission {
        Int id
        String name
    }

    class UserRole {
        Int userId
        Int roleId
    }

    class RolePermission {
        Int roleId
        Int permissionId
    }

    class Module {
        Int id
        String name
        String styles
        String script
    }

    class Subscription {
        Int id
        DateTime dateTo
        DateTime dateFrom
        String domain
        Int agencyId
    }

    User "1" --o "0..1" Agency : agency
    User "1" --o "0..1" Client : client
    User "1" --o "*" UserRole : roles

    Agency "1" --o "*" Subscription : subscriptions
    Agency "1" --o "*" User : users
    Agency "1" --o "*" Order : orders

    Client "1" --o "*" Order : orders
    Client "1" --o "0..1" User : user

    Order "1" --o "1" Client : client
    Order "1" --o "1" Agency : agency

    Role "1" --o "*" UserRole : users
    Role "1" --o "*" RolePermission : permissions

    Permission "1" --o "*" RolePermission : roles

    UserRole "1" --o "1" User : user
    UserRole "1" --o "1" Role : role

    RolePermission "1" --o "1" Role : role
    RolePermission "1" --o "1" Permission : permission

    Subscription "1" --o "1" Agency : agency
    Subscription "1" --o "*" Module : modules

    Module "1" --o "*" Subscription : subscriptions
