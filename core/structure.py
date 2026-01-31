"""
core/structure.py

Sistema de escaneo y descubrimiento de habilidades (skills) de agentes IA.

Este módulo implementa la lógica para:
- Escanear recursivamente el árbol de directorios agents/
- Descubrir archivos SKILL.md en estructura anidada
- Extraer metadatos de las skills
- Generar mapeos para acceso programático

Arquitectura:
    agents/
    ├── infra_ops/
    │   ├── deployment/SKILL.md
    │   └── ...
    ├── domain_core/
    ├── frontend_ux/
    ├── quality_qa/
    └── meta_skills/

Uso:
    from core.structure import AgentStructure
    
    scanner = AgentStructure()
    skills = scanner.discover_all_skills()
    
    for skill in skills:
        print(f"{skill.name}: {skill.path}")
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Optional, Set
from dataclasses import dataclass, field
from enum import Enum


class SkillCategory(Enum):
    """Categorías de habilidades según DDD y Clean Architecture"""
    INFRA_OPS = "infra_ops"           # Infraestructura y operaciones
    DOMAIN_CORE = "domain_core"       # Lógica de negocio
    FRONTEND_UX = "frontend_ux"       # Interfaz de usuario
    QUALITY_QA = "quality_qa"         # Aseguramiento de calidad
    META_SKILLS = "meta_skills"       # Meta-agentes
    UNKNOWN = "unknown"               # Sin categoría


@dataclass
class SkillMetadata:
    """
    Metadatos extraídos de un archivo SKILL.md
    
    Attributes:
        name: Nombre técnico de la skill (nombre del directorio)
        display_name: Nombre legible de la skill
        description: Descripción breve
        category: Categoría DDD/Clean Arch
        path: Ruta absoluta al directorio de la skill
        skill_file: Ruta absoluta al archivo SKILL.md
        triggers: Lista de patrones que activan la skill
        technologies: Tecnologías relacionadas
    """
    name: str
    display_name: str
    description: str
    category: SkillCategory
    path: Path
    skill_file: Path
    triggers: List[str] = field(default_factory=list)
    technologies: List[str] = field(default_factory=list)
    auto_invoke: bool = False
    
    def to_dict(self) -> Dict:
        """Convierte el objeto a diccionario serializable"""
        return {
            "name": self.name,
            "display_name": self.display_name,
            "description": self.description,
            "category": self.category.value,
            "path": str(self.path),
            "skill_file": str(self.skill_file),
            "triggers": self.triggers,
            "technologies": self.technologies,
            "auto_invoke": self.auto_invoke,
        }


class SkillParser:
    """
    Parser para extraer metadatos de archivos SKILL.md
    
    Extrae información estructurada del formato markdown de skills.
    """
    
    @staticmethod
    def parse_skill_file(skill_path: Path) -> Dict[str, any]:
        """
        Parsea un archivo SKILL.md y extrae metadatos
        
        Args:
            skill_path: Ruta al archivo SKILL.md
            
        Returns:
            Diccionario con metadatos extraídos
        """
        metadata = {
            "display_name": "",
            "description": "",
            "triggers": [],
            "technologies": [],
            "auto_invoke": False,
        }
        
        if not skill_path.exists():
            return metadata
        
        try:
            content = skill_path.read_text(encoding="utf-8")
            
            # Extraer título (primera línea que empieza con #)
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            if title_match:
                metadata["display_name"] = title_match.group(1).strip()
            
            # Extraer descripción (primer párrafo después del título)
            desc_match = re.search(r'^#.+?\n\n(.+?)(?:\n\n|\n#)', content, re.MULTILINE | re.DOTALL)
            if desc_match:
                metadata["description"] = desc_match.group(1).strip()
            
            # Extraer triggers (sección "## Trigger" o similar)
            trigger_section = re.search(r'##\s+(?:Trigger|Auto-invoke|Cuando usar).*?\n(.+?)(?:\n##|\Z)', 
                                       content, re.MULTILINE | re.DOTALL | re.IGNORECASE)
            if trigger_section:
                triggers_text = trigger_section.group(1)
                # Buscar patrones de archivos (*.tsx, src/**, etc.)
                file_patterns = re.findall(r'`([^`]+\.[a-z]+)`|`([^`/]+/[^`]+)`', triggers_text)
                metadata["triggers"] = [p[0] or p[1] for p in file_patterns if p[0] or p[1]]
            
            # Extraer tecnologías mencionadas
            tech_keywords = ["React", "Astro", "Flask", "Python", "TypeScript", "PostgreSQL", 
                           "TailwindCSS", "SQLAlchemy", "Zod", "pytest", "Playwright"]
            for tech in tech_keywords:
                if re.search(rf'\b{tech}\b', content, re.IGNORECASE):
                    metadata["technologies"].append(tech)
            
            # Detectar auto-invoke
            if re.search(r'auto[-\s]invoke|always\s+invoke|mandatory', content, re.IGNORECASE):
                metadata["auto_invoke"] = True
                
        except Exception as e:
            print(f"⚠️  Error parseando {skill_path}: {e}")
        
        return metadata


class AgentStructure:
    """
    Escáner de estructura de agentes con soporte para categorías anidadas
    
    Esta clase implementa el descubrimiento automático de skills en la
    estructura jerárquica agents/ siguiendo principios DDD.
    
    Example:
        >>> scanner = AgentStructure()
        >>> skills = scanner.discover_all_skills()
        >>> print(f"Encontradas {len(skills)} skills")
        >>> 
        >>> # Buscar por categoría
        >>> backend_skills = scanner.get_skills_by_category(SkillCategory.DOMAIN_CORE)
        >>> 
        >>> # Buscar por nombre
        >>> api_skill = scanner.find_skill("api-backend")
    """
    
    def __init__(self, agents_root: Optional[Path] = None):
        """
        Inicializa el escáner de estructura
        
        Args:
            agents_root: Ruta raíz del directorio agents/.
                        Si es None, se detecta automáticamente.
        """
        if agents_root is None:
            # Detectar ruta del proyecto (asumiendo que core/ está en la raíz)
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent
            agents_root = project_root / "agents"
        
        self.agents_root = Path(agents_root)
        self.skills: List[SkillMetadata] = []
        self._skills_by_name: Dict[str, SkillMetadata] = {}
        self._skills_by_category: Dict[SkillCategory, List[SkillMetadata]] = {}
    
    def discover_all_skills(self, force_rescan: bool = False) -> List[SkillMetadata]:
        """
        Descubre todas las skills en la estructura de directorios
        
        Args:
            force_rescan: Si es True, re-escanea aunque ya existan skills en caché
            
        Returns:
            Lista de objetos SkillMetadata descubiertos
        """
        if self.skills and not force_rescan:
            return self.skills
        
        self.skills = []
        self._skills_by_name = {}
        self._skills_by_category = {cat: [] for cat in SkillCategory}
        
        if not self.agents_root.exists():
            print(f"⚠️  No se encontró el directorio: {self.agents_root}")
            return []
        
        # Escanear cada categoría
        for category_dir in self.agents_root.iterdir():
            if not category_dir.is_dir() or category_dir.name.startswith('.'):
                continue
            
            # Mapear directorio a categoría
            try:
                category = SkillCategory(category_dir.name)
            except ValueError:
                category = SkillCategory.UNKNOWN
            
            # Escanear skills dentro de la categoría
            self._scan_category(category_dir, category)
        
        print(f"✅ Descubiertas {len(self.skills)} skills en {self.agents_root}")
        return self.skills
    
    def _scan_category(self, category_path: Path, category: SkillCategory):
        """
        Escanea un directorio de categoría en busca de skills
        
        Args:
            category_path: Ruta al directorio de la categoría
            category: Enum de la categoría
        """
        for skill_dir in category_path.iterdir():
            if not skill_dir.is_dir() or skill_dir.name.startswith('.'):
                continue
            
            skill_file = skill_dir / "SKILL.md"
            if not skill_file.exists():
                # Buscar recursivamente en subdirectorios
                for subfile in skill_dir.rglob("SKILL.md"):
                    self._process_skill(subfile.parent, category, subfile)
            else:
                self._process_skill(skill_dir, category, skill_file)
    
    def _process_skill(self, skill_dir: Path, category: SkillCategory, skill_file: Path):
        """
        Procesa una skill individual y la agrega al registro
        
        Args:
            skill_dir: Directorio de la skill
            category: Categoría de la skill
            skill_file: Archivo SKILL.md
        """
        skill_name = skill_dir.name
        
        # Parsear metadatos del archivo SKILL.md
        parsed_metadata = SkillParser.parse_skill_file(skill_file)
        
        metadata = SkillMetadata(
            name=skill_name,
            display_name=parsed_metadata.get("display_name", skill_name),
            description=parsed_metadata.get("description", ""),
            category=category,
            path=skill_dir,
            skill_file=skill_file,
            triggers=parsed_metadata.get("triggers", []),
            technologies=parsed_metadata.get("technologies", []),
            auto_invoke=parsed_metadata.get("auto_invoke", False),
        )
        
        self.skills.append(metadata)
        self._skills_by_name[skill_name] = metadata
        self._skills_by_category[category].append(metadata)
    
    def get_skills_by_category(self, category: SkillCategory) -> List[SkillMetadata]:
        """
        Obtiene todas las skills de una categoría específica
        
        Args:
            category: Categoría a filtrar
            
        Returns:
            Lista de skills de la categoría
        """
        if not self.skills:
            self.discover_all_skills()
        return self._skills_by_category.get(category, [])
    
    def find_skill(self, name: str) -> Optional[SkillMetadata]:
        """
        Busca una skill por su nombre
        
        Args:
            name: Nombre de la skill (nombre del directorio)
            
        Returns:
            Objeto SkillMetadata o None si no se encuentra
        """
        if not self.skills:
            self.discover_all_skills()
        return self._skills_by_name.get(name)
    
    def get_skills_for_file_pattern(self, file_path: str) -> List[SkillMetadata]:
        """
        Encuentra skills aplicables a un patrón de archivo dado
        
        Args:
            file_path: Ruta de archivo (ej: "src/components/Button.tsx")
            
        Returns:
            Lista de skills cuyos triggers coinciden con el patrón
        """
        if not self.skills:
            self.discover_all_skills()
        
        matching_skills = []
        for skill in self.skills:
            for trigger in skill.triggers:
                # Simple pattern matching (mejorar con glob/regex)
                if trigger in file_path or file_path.endswith(trigger):
                    matching_skills.append(skill)
                    break
        
        return matching_skills
    
    def generate_tree(self) -> str:
        """
        Genera un árbol visual de la estructura de skills
        
        Returns:
            String con representación de árbol ASCII
        """
        if not self.skills:
            self.discover_all_skills()
        
        lines = ["agents/"]
        
        for category in SkillCategory:
            skills = self._skills_by_category.get(category, [])
            if not skills:
                continue
            
            lines.append(f"├── {category.value}/ ({len(skills)} skills)")
            for i, skill in enumerate(sorted(skills, key=lambda s: s.name)):
                is_last = (i == len(skills) - 1)
                prefix = "└──" if is_last else "├──"
                lines.append(f"│   {prefix} {skill.name}/")
        
        return "\n".join(lines)
    
    def export_to_json(self, output_path: Optional[Path] = None) -> Dict:
        """
        Exporta la estructura de skills a formato JSON
        
        Args:
            output_path: Ruta opcional donde guardar el JSON
            
        Returns:
            Diccionario con estructura completa
        """
        if not self.skills:
            self.discover_all_skills()
        
        data = {
            "total_skills": len(self.skills),
            "categories": {},
            "skills": [skill.to_dict() for skill in self.skills],
        }
        
        for category in SkillCategory:
            skills = self._skills_by_category.get(category, [])
            data["categories"][category.value] = {
                "count": len(skills),
                "skills": [s.name for s in skills],
            }
        
        if output_path:
            import json
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✅ Estructura exportada a: {output_path}")
        
        return data


# ============================================================================
# CLI para testing y debugging
# ============================================================================

def main():
    """CLI para probar el escáner de estructura"""
    import sys
    
    scanner = AgentStructure()
    
    print("🔍 Escaneando estructura de agentes...\n")
    skills = scanner.discover_all_skills()
    
    print(f"\n📊 Resumen:")
    print(f"   Total de skills: {len(skills)}")
    print(f"   Ruta raíz: {scanner.agents_root}\n")
    
    print("📁 Árbol de estructura:")
    print(scanner.generate_tree())
    print()
    
    # Exportar a JSON
    output_json = scanner.agents_root.parent / ".opencode" / "skills-structure.json"
    scanner.export_to_json(output_json)
    
    # Mostrar detalles de cada categoría
    print("\n📋 Skills por categoría:\n")
    for category in SkillCategory:
        skills = scanner.get_skills_by_category(category)
        if skills:
            print(f"  {category.value}: {len(skills)} skills")
            for skill in skills:
                print(f"    • {skill.name}: {skill.description[:60]}...")
            print()


if __name__ == "__main__":
    main()
