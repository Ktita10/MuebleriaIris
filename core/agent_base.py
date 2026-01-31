"""
core/agent_base.py

Clase base abstracta para agentes de IA que interactúan con skills.

Este módulo define la interfaz común que todos los agentes deben implementar
para trabajar con el sistema de skills de MuebleriaIris.

Arquitectura:
    - BaseAgent: Clase abstracta con interfaz común
    - SkillAgent: Implementación concreta para agentes de skills
    - AgentContext: Contexto de ejecución compartido

Uso:
    from core.agent_base import SkillAgent
    from core.structure import AgentStructure
    
    scanner = AgentStructure()
    agent = SkillAgent(scanner)
    
    # Ejecutar skill
    result = agent.execute_skill("api-backend", context={
        "file_path": "backend/app/routes/productos.py"
    })
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime
import logging

from .structure import AgentStructure, SkillMetadata, SkillCategory


# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# Context and Result Data Classes
# ============================================================================

@dataclass
class AgentContext:
    """
    Contexto de ejecución para un agente
    
    Contiene información sobre el entorno, archivos a procesar,
    y estado compartido entre skills.
    
    Attributes:
        file_path: Ruta del archivo siendo procesado
        project_root: Raíz del proyecto
        user_input: Entrada del usuario
        metadata: Metadatos adicionales
        timestamp: Momento de creación del contexto
    """
    file_path: Optional[str] = None
    project_root: Optional[Path] = None
    user_input: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """Serializa el contexto a diccionario"""
        return {
            "file_path": self.file_path,
            "project_root": str(self.project_root) if self.project_root else None,
            "user_input": self.user_input,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class AgentResult:
    """
    Resultado de la ejecución de un agente
    
    Attributes:
        success: Si la ejecución fue exitosa
        skill_name: Nombre de la skill ejecutada
        output: Salida generada
        errors: Lista de errores encontrados
        warnings: Lista de advertencias
        suggestions: Sugerencias generadas
        metadata: Metadatos adicionales del resultado
    """
    success: bool
    skill_name: str
    output: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Serializa el resultado a diccionario"""
        return {
            "success": self.success,
            "skill_name": self.skill_name,
            "output": self.output,
            "errors": self.errors,
            "warnings": self.warnings,
            "suggestions": self.suggestions,
            "metadata": self.metadata,
        }
    
    def has_issues(self) -> bool:
        """Verifica si hay errores o advertencias"""
        return len(self.errors) > 0 or len(self.warnings) > 0


# ============================================================================
# Base Agent Abstract Class
# ============================================================================

class BaseAgent(ABC):
    """
    Clase base abstracta para agentes de IA
    
    Define la interfaz común que todos los agentes deben implementar
    para interactuar con el sistema de skills.
    
    Los agentes concretos deben implementar:
    - execute_skill(): Ejecutar una skill específica
    - suggest_skills(): Sugerir skills aplicables
    - validate_context(): Validar contexto de ejecución
    """
    
    def __init__(self, name: str):
        """
        Inicializa el agente base
        
        Args:
            name: Nombre identificador del agente
        """
        self.name = name
        self.logger = logging.getLogger(f"{__name__}.{name}")
    
    @abstractmethod
    def execute_skill(
        self, 
        skill_name: str, 
        context: Optional[AgentContext] = None
    ) -> AgentResult:
        """
        Ejecuta una skill específica
        
        Args:
            skill_name: Nombre de la skill a ejecutar
            context: Contexto de ejecución
            
        Returns:
            Resultado de la ejecución
        """
        pass
    
    @abstractmethod
    def suggest_skills(self, context: AgentContext) -> List[SkillMetadata]:
        """
        Sugiere skills aplicables para un contexto dado
        
        Args:
            context: Contexto actual
            
        Returns:
            Lista de skills sugeridas
        """
        pass
    
    @abstractmethod
    def validate_context(self, context: AgentContext) -> bool:
        """
        Valida que el contexto sea válido para el agente
        
        Args:
            context: Contexto a validar
            
        Returns:
            True si el contexto es válido
        """
        pass
    
    def log_info(self, message: str):
        """Registra mensaje informativo"""
        self.logger.info(f"[{self.name}] {message}")
    
    def log_warning(self, message: str):
        """Registra advertencia"""
        self.logger.warning(f"[{self.name}] {message}")
    
    def log_error(self, message: str):
        """Registra error"""
        self.logger.error(f"[{self.name}] {message}")


# ============================================================================
# Skill Agent Implementation
# ============================================================================

class SkillAgent(BaseAgent):
    """
    Implementación concreta de agente que trabaja con skills
    
    Este agente puede:
    - Descubrir skills disponibles
    - Ejecutar skills con contexto
    - Sugerir skills basándose en patrones de archivo
    - Validar que las skills sean aplicables
    
    Example:
        >>> from core.structure import AgentStructure
        >>> scanner = AgentStructure()
        >>> agent = SkillAgent(scanner)
        >>> 
        >>> context = AgentContext(file_path="src/components/Button.tsx")
        >>> suggestions = agent.suggest_skills(context)
        >>> print(f"Skills sugeridas: {[s.name for s in suggestions]}")
    """
    
    def __init__(self, structure: AgentStructure, name: str = "SkillAgent"):
        """
        Inicializa el agente de skills
        
        Args:
            structure: Instancia de AgentStructure para descubrir skills
            name: Nombre del agente (opcional)
        """
        super().__init__(name)
        self.structure = structure
        self.execution_history: List[AgentResult] = []
        
        # Descubrir skills al inicializar
        self.log_info("Descubriendo skills disponibles...")
        self.structure.discover_all_skills()
        self.log_info(f"Descubiertas {len(self.structure.skills)} skills")
    
    def execute_skill(
        self, 
        skill_name: str, 
        context: Optional[AgentContext] = None
    ) -> AgentResult:
        """
        Ejecuta una skill específica
        
        Args:
            skill_name: Nombre de la skill a ejecutar
            context: Contexto de ejecución
            
        Returns:
            Resultado de la ejecución
        """
        if context is None:
            context = AgentContext()
        
        self.log_info(f"Ejecutando skill: {skill_name}")
        
        # Buscar la skill
        skill = self.structure.find_skill(skill_name)
        if not skill:
            error_msg = f"Skill '{skill_name}' no encontrada"
            self.log_error(error_msg)
            result = AgentResult(
                success=False,
                skill_name=skill_name,
                errors=[error_msg]
            )
            self.execution_history.append(result)
            return result
        
        # Validar contexto
        if not self.validate_context(context):
            error_msg = "Contexto inválido para la ejecución"
            self.log_error(error_msg)
            result = AgentResult(
                success=False,
                skill_name=skill_name,
                errors=[error_msg]
            )
            self.execution_history.append(result)
            return result
        
        try:
            # Leer contenido de la skill
            skill_content = skill.skill_file.read_text(encoding="utf-8")
            
            # Construir output con información de la skill
            output = self._build_skill_output(skill, skill_content, context)
            
            result = AgentResult(
                success=True,
                skill_name=skill_name,
                output=output,
                metadata={
                    "skill_path": str(skill.path),
                    "category": skill.category.value,
                    "technologies": skill.technologies,
                }
            )
            
            self.log_info(f"Skill '{skill_name}' ejecutada exitosamente")
            self.execution_history.append(result)
            return result
            
        except Exception as e:
            error_msg = f"Error ejecutando skill: {str(e)}"
            self.log_error(error_msg)
            result = AgentResult(
                success=False,
                skill_name=skill_name,
                errors=[error_msg]
            )
            self.execution_history.append(result)
            return result
    
    def _build_skill_output(
        self, 
        skill: SkillMetadata, 
        content: str, 
        context: AgentContext
    ) -> str:
        """
        Construye el output de una skill ejecutada
        
        Args:
            skill: Metadatos de la skill
            content: Contenido del archivo SKILL.md
            context: Contexto de ejecución
            
        Returns:
            String con el output formateado
        """
        output_lines = [
            f"# Skill: {skill.display_name}",
            f"",
            f"**Categoría:** {skill.category.value}",
            f"**Descripción:** {skill.description}",
            f"",
        ]
        
        if skill.technologies:
            output_lines.append(f"**Tecnologías:** {', '.join(skill.technologies)}")
            output_lines.append("")
        
        if context.file_path:
            output_lines.append(f"**Archivo:** {context.file_path}")
            output_lines.append("")
        
        output_lines.append("---")
        output_lines.append("")
        output_lines.append(content)
        
        return "\n".join(output_lines)
    
    def suggest_skills(self, context: AgentContext) -> List[SkillMetadata]:
        """
        Sugiere skills aplicables para un contexto dado
        
        Args:
            context: Contexto actual (con file_path, user_input, etc.)
            
        Returns:
            Lista de skills sugeridas, ordenadas por relevancia
        """
        suggestions = []
        
        # Sugerir basándose en file_path
        if context.file_path:
            file_skills = self.structure.get_skills_for_file_pattern(context.file_path)
            suggestions.extend(file_skills)
            self.log_info(f"Encontradas {len(file_skills)} skills para: {context.file_path}")
        
        # Sugerir basándose en categoría (si está en metadata)
        if "category" in context.metadata:
            try:
                category = SkillCategory(context.metadata["category"])
                category_skills = self.structure.get_skills_by_category(category)
                suggestions.extend(category_skills)
                self.log_info(f"Encontradas {len(category_skills)} skills para categoría: {category.value}")
            except ValueError:
                pass
        
        # Eliminar duplicados manteniendo orden
        seen = set()
        unique_suggestions = []
        for skill in suggestions:
            if skill.name not in seen:
                seen.add(skill.name)
                unique_suggestions.append(skill)
        
        # Priorizar skills con auto_invoke
        unique_suggestions.sort(key=lambda s: (not s.auto_invoke, s.name))
        
        return unique_suggestions
    
    def validate_context(self, context: AgentContext) -> bool:
        """
        Valida que el contexto sea válido
        
        Args:
            context: Contexto a validar
            
        Returns:
            True si el contexto es válido
        """
        # Validación básica - puede extenderse según necesidades
        return context is not None
    
    def get_execution_history(self) -> List[AgentResult]:
        """Retorna el historial de ejecuciones"""
        return self.execution_history
    
    def get_skills_by_category(self, category: SkillCategory) -> List[SkillMetadata]:
        """
        Obtiene todas las skills de una categoría
        
        Args:
            category: Categoría a buscar
            
        Returns:
            Lista de skills de la categoría
        """
        return self.structure.get_skills_by_category(category)
    
    def get_all_skills(self) -> List[SkillMetadata]:
        """Retorna todas las skills disponibles"""
        return self.structure.skills


# ============================================================================
# Agent Factory
# ============================================================================

class AgentFactory:
    """
    Factory para crear agentes con configuración predeterminada
    """
    
    @staticmethod
    def create_skill_agent(agents_root: Optional[Path] = None) -> SkillAgent:
        """
        Crea una instancia de SkillAgent con AgentStructure
        
        Args:
            agents_root: Ruta raíz de agents/ (opcional)
            
        Returns:
            Instancia de SkillAgent lista para usar
        """
        structure = AgentStructure(agents_root)
        agent = SkillAgent(structure)
        return agent


# ============================================================================
# CLI para testing y debugging
# ============================================================================

def main():
    """CLI para probar el agente base"""
    print("🤖 Inicializando SkillAgent...\n")
    
    # Crear agente
    agent = AgentFactory.create_skill_agent()
    
    # Mostrar skills disponibles
    print(f"📋 Skills disponibles: {len(agent.get_all_skills())}\n")
    
    # Probar sugerencias basadas en archivo
    test_files = [
        "src/components/ui/Button.tsx",
        "backend/app/routes/productos.py",
        "src/pages/index.astro",
        "backend/tests/test_api.py",
    ]
    
    print("🔍 Probando sugerencias de skills:\n")
    for file_path in test_files:
        context = AgentContext(file_path=file_path)
        suggestions = agent.suggest_skills(context)
        
        print(f"  📄 {file_path}")
        if suggestions:
            for skill in suggestions[:3]:  # Mostrar top 3
                print(f"     → {skill.name} ({skill.category.value})")
        else:
            print("     (sin sugerencias)")
        print()
    
    # Ejecutar una skill de ejemplo
    print("\n🚀 Ejecutando skill de ejemplo: api-backend\n")
    context = AgentContext(
        file_path="backend/app/routes/test.py",
        user_input="Crear nuevo endpoint"
    )
    result = agent.execute_skill("api-backend", context)
    
    if result.success:
        print(f"✅ Ejecución exitosa")
        print(f"\nOutput (primeras 500 chars):")
        print(result.output[:500] if result.output else "(sin output)")
    else:
        print(f"❌ Ejecución falló:")
        for error in result.errors:
            print(f"   - {error}")


if __name__ == "__main__":
    main()
