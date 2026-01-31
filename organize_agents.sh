#!/bin/bash

################################################################################
# organize_agents.sh
# 
# Script para reorganizar la estructura de carpetas /agents/ siguiendo
# principios de Clean Architecture y Domain Driven Design (DDD)
#
# Estructura objetivo:
#   agents/
#   ├── infra_ops/        (Infraestructura y operaciones)
#   ├── domain_core/      (Lógica de negocio central)
#   ├── frontend_ux/      (Interfaz de usuario)
#   ├── quality_qa/       (Aseguramiento de calidad)
#   └── meta_skills/      (Meta-agentes)
#
# Uso: ./organize_agents.sh
################################################################################

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     MuebleriaIris - Reorganización de Agentes DDD        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "agents" ]; then
    echo -e "${RED}❌ Error: No se encontró la carpeta 'agents'${NC}"
    echo "   Por favor ejecuta este script desde la raíz del proyecto MuebleriaIris"
    exit 1
fi

echo -e "${YELLOW}📋 Paso 1: Crear estructura de directorios...${NC}"

# Crear nuevas carpetas principales
mkdir -p agents/infra_ops
mkdir -p agents/domain_core
mkdir -p agents/frontend_ux
mkdir -p agents/quality_qa
mkdir -p agents/meta_skills

echo -e "${GREEN}✓ Estructura de directorios creada${NC}"
echo ""

echo -e "${YELLOW}📦 Paso 2: Mover agentes a categorías correspondientes...${NC}"
echo ""

# Función para mover carpetas con feedback
move_agent() {
    local source=$1
    local dest=$2
    local category=$3
    
    if [ -d "agents/$source" ]; then
        echo -e "  ${BLUE}→${NC} Moviendo ${source} a ${category}/"
        mv "agents/$source" "agents/$dest/$source"
    else
        echo -e "  ${YELLOW}⚠${NC} No encontrado: ${source} (omitido)"
    fi
}

# ============================================================================
# CATEGORÍA: INFRA_OPS (Infraestructura y Operaciones)
# ============================================================================
echo -e "${BLUE}🏗️  Infraestructura y Operaciones (infra_ops):${NC}"
move_agent "deployment" "infra_ops" "infra_ops"
move_agent "git-workflow" "infra_ops" "infra_ops"
move_agent "python-dev" "infra_ops" "infra_ops"
move_agent "error-handling" "infra_ops" "infra_ops"
move_agent "documentation" "infra_ops" "infra_ops"
echo ""

# ============================================================================
# CATEGORÍA: DOMAIN_CORE (Lógica de Negocio)
# ============================================================================
echo -e "${BLUE}🎯 Lógica de Negocio (domain_core):${NC}"
move_agent "api-backend" "domain_core" "domain_core"
move_agent "database" "domain_core" "domain_core"
move_agent "auth-security" "domain_core" "domain_core"
move_agent "external-integrations" "domain_core" "domain_core"
echo ""

# ============================================================================
# CATEGORÍA: FRONTEND_UX (Interfaz de Usuario)
# ============================================================================
echo -e "${BLUE}🎨 Frontend y UX (frontend_ux):${NC}"
move_agent "astro-pages" "frontend_ux" "frontend_ux"
move_agent "react-components" "frontend_ux" "frontend_ux"
move_agent "ui-components" "frontend_ux" "frontend_ux"
move_agent "responsive-design" "frontend_ux" "frontend_ux"
move_agent "forms-validation" "frontend_ux" "frontend_ux"
echo ""

# ============================================================================
# CATEGORÍA: QUALITY_QA (Aseguramiento de Calidad)
# ============================================================================
echo -e "${BLUE}🧪 Aseguramiento de Calidad (quality_qa):${NC}"
move_agent "testing-backend" "quality_qa" "quality_qa"
move_agent "testing-frontend" "quality_qa" "quality_qa"
echo ""

# ============================================================================
# CATEGORÍA: META_SKILLS (Meta-agentes)
# ============================================================================
echo -e "${BLUE}🤖 Meta-agentes (meta_skills):${NC}"
move_agent "skill-creator" "meta_skills" "meta_skills"
move_agent "skill-sync" "meta_skills" "meta_skills"
echo ""

# ============================================================================
# CREAR README.md EN CADA CATEGORÍA
# ============================================================================
echo -e "${YELLOW}📝 Paso 3: Crear archivos README.md descriptivos...${NC}"

# infra_ops README
cat > agents/infra_ops/README.md << 'EOF'
# Infraestructura y Operaciones (infra_ops)

Agentes relacionados con infraestructura, despliegue y operaciones del proyecto.

## Agentes incluidos

- **deployment**: Patrones de despliegue (Docker, CI/CD)
- **git-workflow**: Flujo de trabajo Git y convenciones de PR
- **python-dev**: Estándares de desarrollo Python
- **error-handling**: Manejo de errores y logging
- **documentation**: Estándares de documentación

## Principios

- Automatización de operaciones
- Reproducibilidad de entornos
- Observabilidad y monitoreo
- Documentación como código
EOF

# domain_core README
cat > agents/domain_core/README.md << 'EOF'
# Lógica de Negocio (domain_core)

Agentes que implementan la lógica de negocio central del ERP de mueblería.

## Agentes incluidos

- **api-backend**: Patrones de API REST con Flask
- **database**: Esquema PostgreSQL y migraciones
- **auth-security**: Autenticación JWT, RBAC, seguridad
- **external-integrations**: APIs externas (MercadoPago, emails)

## Principios DDD

- Modelo de dominio rico
- Agregados y entidades
- Repositorios y servicios
- Separación de responsabilidades
EOF

# frontend_ux README
cat > agents/frontend_ux/README.md << 'EOF'
# Frontend y Experiencia de Usuario (frontend_ux)

Agentes para desarrollo de interfaz de usuario con Astro y React.

## Agentes incluidos

- **astro-pages**: Enrutamiento Astro 5, Islands, patrones SSR
- **react-components**: Hooks y componentes React 19
- **ui-components**: Patrones Astro + React + TailwindCSS
- **responsive-design**: Patrones de diseño responsivo
- **forms-validation**: Validación con react-hook-form + Zod

## Principios

- Componentes reutilizables
- Accesibilidad (a11y)
- Rendimiento y optimización
- Mobile-first design
EOF

# quality_qa README
cat > agents/quality_qa/README.md << 'EOF'
# Aseguramiento de Calidad (quality_qa)

Agentes para pruebas automatizadas y garantía de calidad.

## Agentes incluidos

- **testing-backend**: Pruebas de backend con pytest
- **testing-frontend**: Pruebas de frontend (Playwright, RTL)

## Principios

- Test-Driven Development (TDD)
- Pirámide de pruebas
- Cobertura de código
- Integración continua
EOF

# meta_skills README
cat > agents/meta_skills/README.md << 'EOF'
# Meta-agentes (meta_skills)

Agentes que gestionan y crean otros agentes del sistema.

## Agentes incluidos

- **skill-creator**: Crear nuevas habilidades de agente
- **skill-sync**: Sincronizar metadatos de habilidades

## Propósito

Estos agentes son herramientas para extender y mantener el sistema de skills,
permitiendo la creación de nuevos agentes y la sincronización de metadatos.
EOF

echo -e "${GREEN}✓ Archivos README.md creados${NC}"
echo ""

# ============================================================================
# ACTUALIZAR ENLACES SIMBÓLICOS DE .github/skills
# ============================================================================
echo -e "${YELLOW}🔗 Paso 4: Actualizar enlaces simbólicos de .github/skills...${NC}"

if [ -d ".github/skills" ]; then
    # Eliminar enlaces antiguos
    rm -rf .github/skills/*
    
    # Recrear enlaces con nuevas rutas
    ln -sf ../../agents/infra_ops/deployment .github/skills/muebleria-deployment
    ln -sf ../../agents/infra_ops/git-workflow .github/skills/pull-request
    ln -sf ../../agents/infra_ops/python-dev .github/skills/muebleria-python
    ln -sf ../../agents/infra_ops/error-handling .github/skills/muebleria-errors
    ln -sf ../../agents/infra_ops/documentation .github/skills/muebleria-docs
    
    ln -sf ../../agents/domain_core/api-backend .github/skills/muebleria-api
    ln -sf ../../agents/domain_core/database .github/skills/muebleria-db
    ln -sf ../../agents/domain_core/auth-security .github/skills/muebleria-security
    ln -sf ../../agents/domain_core/external-integrations .github/skills/muebleria-integrations
    
    ln -sf ../../agents/frontend_ux/astro-pages .github/skills/muebleria-astro
    ln -sf ../../agents/frontend_ux/react-components .github/skills/muebleria-react
    ln -sf ../../agents/frontend_ux/ui-components .github/skills/muebleria-ui
    ln -sf ../../agents/frontend_ux/responsive-design .github/skills/muebleria-mobile
    ln -sf ../../agents/frontend_ux/forms-validation .github/skills/muebleria-forms
    
    ln -sf ../../agents/quality_qa/testing-backend .github/skills/muebleria-test-api
    ln -sf ../../agents/quality_qa/testing-frontend .github/skills/muebleria-test-ui
    
    ln -sf ../../agents/meta_skills/skill-creator .github/skills/skill-creator
    ln -sf ../../agents/meta_skills/skill-sync .github/skills/skill-sync
    
    echo -e "${GREEN}✓ Enlaces simbólicos actualizados${NC}"
else
    echo -e "${YELLOW}⚠ No se encontró .github/skills (omitido)${NC}"
fi
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Reorganización completada                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Estructura final:${NC}"
echo ""
echo "agents/"
echo "├── infra_ops/          (Infraestructura y operaciones)"
echo "├── domain_core/        (Lógica de negocio central)"
echo "├── frontend_ux/        (Interfaz de usuario)"
echo "├── quality_qa/         (Aseguramiento de calidad)"
echo "└── meta_skills/        (Meta-agentes)"
echo ""
echo -e "${YELLOW}⚠️  Próximos pasos:${NC}"
echo "  1. Revisar y actualizar AGENTS.md"
echo "  2. Actualizar .clinerules con las nuevas rutas"
echo "  3. Ejecutar organize_backend.sh para limpiar /backend"
echo "  4. Ejecutar pruebas para verificar que todo funciona"
echo ""
echo -e "${BLUE}💡 Tip: Ejecuta 'tree agents/' para ver la estructura completa${NC}"
echo ""
