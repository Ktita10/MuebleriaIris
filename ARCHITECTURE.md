# MuebleriaIris - Nueva Arquitectura

## Árbol de Directorios Completo (Post-Refactorización)

```
MuebleriaIris/
│
├── 📁 core/                          # ✨ NUEVO: Módulo core para agentes
│   ├── __init__.py                   # Exports públicos
│   ├── structure.py                  # Escaneo de skills
│   ├── agent_base.py                 # Clase base para agentes
│   └── README.md                     # Documentación del módulo
│
├── 📁 agents/                        # 🔄 REORGANIZADO: Estructura DDD
│   │
│   ├── 📁 infra_ops/                 # Infraestructura y operaciones
│   │   ├── README.md
│   │   ├── deployment/
│   │   │   └── SKILL.md
│   │   ├── git-workflow/
│   │   │   └── SKILL.md
│   │   ├── python-dev/
│   │   │   └── SKILL.md
│   │   ├── error-handling/
│   │   │   └── SKILL.md
│   │   └── documentation/
│   │       └── SKILL.md
│   │
│   ├── 📁 domain_core/               # Lógica de negocio
│   │   ├── README.md
│   │   ├── api-backend/
│   │   │   └── SKILL.md
│   │   ├── database/
│   │   │   └── SKILL.md
│   │   ├── auth-security/
│   │   │   └── SKILL.md
│   │   └── external-integrations/
│   │       └── SKILL.md
│   │
│   ├── 📁 frontend_ux/               # Interfaz de usuario
│   │   ├── README.md
│   │   ├── astro-pages/
│   │   │   └── SKILL.md
│   │   ├── react-components/
│   │   │   └── SKILL.md
│   │   ├── ui-components/
│   │   │   └── SKILL.md
│   │   ├── responsive-design/
│   │   │   └── SKILL.md
│   │   └── forms-validation/
│   │       └── SKILL.md
│   │
│   ├── 📁 quality_qa/                # Aseguramiento de calidad
│   │   ├── README.md
│   │   ├── testing-backend/
│   │   │   └── SKILL.md
│   │   └── testing-frontend/
│   │       └── SKILL.md
│   │
│   └── 📁 meta_skills/               # Meta-agentes
│       ├── README.md
│       ├── skill-creator/
│       │   └── SKILL.md
│       └── skill-sync/
│           └── SKILL.md
│
├── 📁 backend/                       # 🔄 LIMPIO: Backend organizado
│   │
│   ├── 📁 app/                       # Código de aplicación
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── security.py
│   │   ├── 📁 routes/
│   │   │   ├── __init__.py
│   │   │   ├── admin.py
│   │   │   ├── catalogo.py
│   │   │   ├── comercial.py
│   │   │   ├── logistica.py
│   │   │   ├── pagos.py
│   │   │   └── favoritos.py
│   │   ├── 📁 services/
│   │   │   ├── __init__.py
│   │   │   └── producto_service.py
│   │   └── 📁 utils/
│   │       ├── __init__.py
│   │       ├── helpers.py
│   │       └── validators.py
│   │
│   ├── 📁 alembic/                   # Migraciones de BD
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── 📁 tests/                     # Pruebas automatizadas
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_productos.py
│   │   ├── test_ordenes.py
│   │   └── ...
│   │
│   ├── 📁 scripts/                   # ✨ NUEVO: Scripts organizados
│   │   ├── README.md
│   │   ├── 📁 seeds/                 # Scripts de población
│   │   │   ├── README.md
│   │   │   ├── seed_data.py
│   │   │   ├── seed_inventario.py
│   │   │   └── seed_ordenes.py
│   │   ├── 📁 maintenance/           # Scripts de mantenimiento
│   │   │   ├── README.md
│   │   │   ├── check_ordenes.py
│   │   │   ├── clear_alembic.py
│   │   │   ├── audit_schema.py
│   │   │   └── test_complete_crud.py
│   │   └── 📁 ops/                   # Scripts de operaciones
│   │       ├── README.md
│   │       ├── backup_database.sh
│   │       ├── restore_database.sh
│   │       └── start-backend.sh
│   │
│   ├── run.py                        # Entry point
│   ├── config.py                     # Configuración
│   ├── requirements.txt              # Dependencias
│   └── alembic.ini                   # Config Alembic
│
├── 📁 src/                           # Frontend (sin cambios)
│   ├── 📁 components/
│   │   ├── ui/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── cart/
│   │   └── ...
│   ├── 📁 pages/
│   │   ├── index.astro
│   │   ├── catalogo/
│   │   ├── admin/
│   │   └── ...
│   ├── 📁 layouts/
│   ├── 📁 lib/
│   ├── 📁 stores/
│   └── 📁 types/
│
├── 📁 docs/                          # Documentación
│   ├── guides/
│   ├── ai-agents/
│   └── troubleshooting/
│
├── 📁 .github/                       # GitHub config
│   └── skills/                       # 🔄 ACTUALIZADO: Symlinks nuevos
│       ├── muebleria-api -> ../../agents/domain_core/api-backend/
│       ├── muebleria-ui -> ../../agents/frontend_ux/ui-components/
│       └── ...
│
├── 📁 .opencode/                     # OpenCode config
│   ├── rules.md
│   └── skills-map.json
│
├── 📄 organize_agents.sh             # ✨ NUEVO: Script reorganización
├── 📄 organize_backend.sh            # ✨ NUEVO: Script limpieza backend
├── 📄 AGENTS.md                      # 🔄 ACTUALIZAR
├── 📄 .clinerules                    # 🔄 ACTUALIZAR
├── 📄 README.md
├── 📄 package.json
├── 📄 astro.config.mjs
└── 📄 tsconfig.json
```

## Leyenda

- 📁 = Directorio
- 📄 = Archivo
- ✨ NUEVO = Creado en esta refactorización
- 🔄 = Modificado/Reorganizado

## Comparación: Antes vs Después

### Antes (Estructura Plana)

```
agents/
├── api-backend/
├── astro-pages/
├── auth-security/
├── database/
├── deployment/
├── documentation/
├── error-handling/
├── external-integrations/
├── forms-validation/
├── git-workflow/
├── python-dev/
├── react-components/
├── responsive-design/
├── skill-creator/
├── skill-sync/
├── testing-backend/
├── testing-frontend/
└── ui-components/        # 18 carpetas mezcladas
```

### Después (Estructura DDD)

```
agents/
├── infra_ops/           (5 skills)
├── domain_core/         (4 skills)
├── frontend_ux/         (5 skills)
├── quality_qa/          (2 skills)
└── meta_skills/         (2 skills)
                         # 5 categorías organizadas
```

## Beneficios de la Nueva Arquitectura

### 1. **Separación de Responsabilidades (SRP)**
- Cada categoría tiene un propósito único y claro
- Facilita encontrar skills por dominio

### 2. **Escalabilidad**
- Fácil agregar nuevas skills en categorías existentes
- Posibilidad de crear sub-categorías si es necesario

### 3. **Mantenibilidad**
- Código relacionado está junto (cohesión)
- Reducción de complejidad cognitiva

### 4. **Navegación Intuitiva**
- Estructura refleja el modelo mental del dominio
- Documentación auto-explicativa (READMEs por categoría)

### 5. **Integración con Herramientas**
- Compatible con GitHub Copilot (symlinks)
- Compatible con OpenCode
- CLI para testing (`core/` modules)

## Próximos Pasos

1. ✅ Ejecutar `./organize_agents.sh`
2. ✅ Ejecutar `./organize_backend.sh`
3. ⏳ Actualizar `AGENTS.md` con nueva estructura
4. ⏳ Actualizar `.clinerules` con nuevas rutas
5. ⏳ Ejecutar tests para verificar integridad
6. ⏳ Actualizar documentación

## Comandos de Ejecución

```bash
# 1. Reorganizar agentes
chmod +x organize_agents.sh
./organize_agents.sh

# 2. Limpiar backend
chmod +x organize_backend.sh
./organize_backend.sh

# 3. Probar core modules
python core/structure.py
python core/agent_base.py

# 4. Verificar pruebas
pytest backend/tests/
npm test
```

---

**Versión:** 2.0.0 (Post-Refactorización)  
**Fecha:** 2026-01-31  
**Arquitectura:** Clean Architecture + DDD
