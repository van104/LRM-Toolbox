import type { Component } from 'vue';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  svgIcon?: string;
  category: string;
  path: string;
  component?: Component;
  tags?: string[];
}

export interface CategoryMetadata {
  id: string;
  name: string;
  icon: string;
  description?: string;
}
