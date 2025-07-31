/**
 * Create Agent Page
 * 
 * Next.js app router page wrapper for agent creation.
 * Renders the CreateAndChatPage component for creating new CustomGPT agents.
 * 
 * Purpose:
 * - Provides the /create route
 * - Wraps the agent creation component
 * - Enables client-side rendering
 * 
 * Route: /create
 * 
 * Features delegated to CreateAndChatPage:
 * - Multi-step agent creation wizard
 * - Data source configuration
 * - Real-time agent testing
 * - Creation success handling
 * 
 * @see CreateAndChatPage for implementation details
 */

'use client';

import { CreateAndChatPage } from '@/components/agent/CreateAndChatPage';

/**
 * Create Agent Page Component
 * 
 * Simple wrapper that renders the agent creation interface.
 * All functionality is implemented in the CreateAndChatPage component.
 */
export default function CreateAgentPage() {
  return <CreateAndChatPage />;
}