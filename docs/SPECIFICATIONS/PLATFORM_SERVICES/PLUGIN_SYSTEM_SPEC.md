# Plugin System Specification

Version: 1.0

## Plugin Contract
- id
- version
- capabilities
- permissions
- dependencies

## Lifecycle
Discover → Validate → Load → Initialize → Execute → Unload

Plugins must be sandboxed when possible.
