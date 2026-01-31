"""
core/__init__.py

Core module for MuebleriaIris agent system.

Provides utilities for discovering, managing, and executing agent skills
following Clean Architecture and DDD principles.
"""

from .structure import (
    AgentStructure,
    SkillMetadata,
    SkillCategory,
    SkillParser,
)

from .agent_base import (
    BaseAgent,
    SkillAgent,
    AgentContext,
    AgentResult,
    AgentFactory,
)

__version__ = "1.0.0"

__all__ = [
    # Structure
    "AgentStructure",
    "SkillMetadata",
    "SkillCategory",
    "SkillParser",
    # Agent Base
    "BaseAgent",
    "SkillAgent",
    "AgentContext",
    "AgentResult",
    "AgentFactory",
]
