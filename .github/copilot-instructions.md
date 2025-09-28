# Multi-Tool Web Platform - Copilot Instructions

This is a modular web platform built with Next.js 14+ that hosts multiple productivity tools. The platform is designed for scalability, maintainability, and easy addition of new tools with different tech stacks.

## Project Architecture

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for consistency
- **Modular Design**: Each tool is a self-contained module
- **Current Tools**: Cost Comparison Tool (with plans for ROI Calculator, Time Tracker, etc.)

## Key Design Principles

1. **Modularity**: Each tool should be independent and easily pluggable
2. **Consistency**: Shared UI components and design system
3. **Type Safety**: Comprehensive TypeScript interfaces
4. **Performance**: Lazy loading and optimized rendering
5. **Accessibility**: Full keyboard navigation and screen reader support

## Development Guidelines

- Use consistent naming conventions across all tools
- Comment complex business logic thoroughly
- Create reusable hooks for common patterns
- Build type-safe interfaces for all data structures
- Maintain 80%+ shared component reuse across tools

## Current Project Structure

```
/src
  /app
    /tools
      /cost-comparison     # First tool implementation
      /[tool-id]          # Dynamic routing for future tools
    /components
      /ui                 # Shared UI component library
      /layout            # Navigation, headers, footers
    /lib
      /utils             # Shared utilities
      /types             # Global TypeScript types
  /tools-config.ts       # Tool registry and metadata
```

## Progress Tracking

- [x] Project foundation setup
- [ ] Shared UI component library
- [ ] Tool registration system
- [ ] Platform navigation
- [ ] Cost Comparison Tool implementation
- [ ] Landing page and documentation

When working on this project, prioritize modularity and maintain consistency with the established architecture patterns.