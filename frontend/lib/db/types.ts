export interface User {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  name: string;
  slug: string;
  worker_type: string;
  status: string;
  description: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  agent_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: string;
  content: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  agent_id: string | null;
  worker_id: string | null;
  title: string;
  status: string;
  priority: string;
  input: Record<string, any>;
  output: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface Run {
  id: string;
  task_id: string | null;
  agent_id: string | null;
  worker_id: string | null;
  automation_id: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
}

export interface Automation {
  id: string;
  name: string;
  provider: string;
  external_workflow_id: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  provider: string;
  name: string;
  status: string;
  config_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  source_type: string;
  source_id: string | null;
  event_type: string;
  level: string;
  message: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface FileRecord {
  id: string;
  owner_type: string | null;
  owner_id: string | null;
  file_name: string;
  storage_provider: string;
  storage_key: string;
  mime_type: string | null;
  size_bytes: number | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ServiceConnection {
  id: string;
  service_name: string;
  provider: string;
  status: string;
  last_checked_at: string | null;
  last_error: string | null;
  metadata: Record<string, any>;
}
