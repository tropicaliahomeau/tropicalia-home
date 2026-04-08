# Tropicalia Home Web App - Implementation Plan

This plan outlines the steps to build the Tropicalia Home web application, focusing on a premium user experience, robust role management, and core business features.

## Phase 1: Foundation & Aesthetics
- [x] **Project Structure Setup**: Organize `app`, `components`, `lib`, `hooks`, `types`.
- [x] **Global Design System**: Implement a "Rich Aesthetics" design system using CSS Variables for colors, typography, and spacing.
    -   Vibrant color palette (Tropical theme + Modern UI).
    -   Responsive typography.
    -   Smooth transitions and micro-animations.
- [x] **Core Layout**: Create a responsive `layout.tsx` with a premium Navigation Bar and Footer.

## Phase 2: Authentication & User Roles (Mocked Initially)
- [x] **User Context**: Create a `UserContext` to manage authentication state (Admin, Staff, Client).
- [x] **Auth Pages**:
    -   Login Page with modern design.
    -   Register Page (Client registration).
- [x] **Role-Based Routing**: Protect routes based on user roles.

## Phase 3: Core Features - Subscription & Orders
- [x] **Weekly Subscription Page**:
    -   Display lunch options for the week.
    -   Interactive selection interface.
    -   "Subscribe" workflow.
- [x] **Dashboard Views**:
    -   **Client Dashboard**: View active subscription, order status.
    -   **Staff Dashboard**: List of daily orders, status toggles (Pending -> Ready -> Delivered).
    -   **Admin Dashboard**: Overview of all users and subscriptions.
- [x] **Order Management Logic**: Connect Client and Staff dashboards via shared state.

## Phase 4: Communication
- [x] **Messaging System**: simple chat interface for Client-Staff communication.

## Phase 5: Polish & SEO
- [x] **SEO Optimization**: Metadata, Semantic HTML.
- [x] **Performance Tuning**: optimize images, code splitting.
- [x] **Final Polish**: Ensure all interactions are smooth and "wow" the user.
