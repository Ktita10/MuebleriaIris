# core/

Módulo core para el sistema de agentes de MuebleriaIris.

## Descripción

Este módulo proporciona la infraestructura base para descubrir, gestionar y ejecutar habilidades (skills) de agentes IA siguiendo principios de Clean Architecture y Domain Driven Design.

## Estructura

```
core/
├── __init__.py          # Exports públicos del módulo
├── structure.py         # Escaneo y descubrimiento de skills
├── agent_base.py        # Clase base para agentes
└── README.md           # Esta documentación
```

## Componentes principales

### 1. AgentStructure (`structure.py`)

Escáner de estructura de agentes con soporte para categorías anidadas DDD.

**Uso:**
```python
from core import AgentStructure

scanner = AgentStructure()
skills = scanner.discover_all_skills()

# Buscar por categoría
backend_skills = scanner.get_skills_by_category(SkillCategory.DOMAIN_CORE)

# Buscar por nombre
api_skill = scanner.find_skill("api-backend")

# Exportar a JSON
scanner.export_to_json("skills-structure.json")
```

### 2. SkillAgent (`agent_base.py`)

Agente que ejecuta skills con contexto y sugiere skills aplicables.

**Uso:**
```python
from core import AgentFactory, AgentContext

# Crear agente
agent = AgentFactory.create_skill_agent()

# Sugerir skills para un archivo
context = AgentContext(file_path="src/components/Button.tsx")
suggestions = agent.suggest_skills(context)

# Ejecutar skill
result = agent.execute_skill("react-components", context)
if result.success:
    print(result.output)
```

### 3. Categorías DDD

El sistema organiza las skills en 5 categorías principales:

- **infra_ops**: Infraestructura y operaciones
- **domain_core**: Lógica de negocio central
- **frontend_ux**: Interfaz de usuario
- **quality_qa**: Aseguramiento de calidad
- **meta_skills**: Meta-agentes

## CLI para testing

Ambos módulos incluyen CLI para pruebas:

```bash
# Escanear estructura
python core/structure.py

# Probar agente
python core/agent_base.py
```

## Integración con el proyecto

Este módulo core es usado por:

- Scripts de organización (`organize_agents.sh`)
- Sistema de auto-invocación de skills
- GitHub Copilot integration
- OpenCode agent configuration

## Desarrollo

### Agregar nueva categoría

1. Editar `SkillCategory` enum en `structure.py`
2. Crear directorio en `agents/nueva_categoria/`
3. Re-ejecutar scripts de organización

### Extender BaseAgent

```python
from core.agent_base import BaseAgent, AgentContext, AgentResult

class CustomAgent(BaseAgent):
    def execute_skill(self, skill_name, context=None):
        # Implementación personalizada
        pass
    
    def suggest_skills(self, context):
        # Implementación personalizada
        pass
    
    def validate_context(self, context):
        # Implementación personalizada
        pass
```

## Dependencias

- Python 3.9+
- pathlib (stdlib)
- dataclasses (stdlib)
- typing (stdlib)
- logging (stdlib)

No requiere dependencias externas.

## Licencia

Parte del proyecto privado MuebleriaIris ERP.
