# ⚡ Quick Start: Sistema de Subagentes MuebleriaIris

## 🚀 Configuración en 3 Pasos (5 minutos)

### Paso 1: Ejecutar Setup
```bash
cd /home/matias-fuentes/Escritorio/Proyectos/Muebleria/MuebleriaIris
./agents/setup.sh
```

Selecciona tu IA:
- `1` → Claude Code ✅ (recomendado)
- `2` → Gemini CLI
- `3` → Codex (OpenAI)
- `4` → GitHub Copilot ✅ (recomendado)
- `a` → Todas

### Paso 2: Reiniciar IA

Cierra y abre tu asistente de IA.

### Paso 3: Verificar

```bash
# Ver skills disponibles
ls agents/
# Debe mostrar: 12 carpetas

# Verificar symlinks
ls -la .claude/agents/    # o .codex/agents/ o .github/
```

✅ **Listo!** El sistema está operativo.

---

## 📋 Skills Disponibles

| Skill | Cuándo Usar | Líneas |
|-------|-------------|--------|
| `muebleria-ui` | Componentes Astro/React | 131 |
| `muebleria-react` | Hooks, state, forms | 238 |
| `muebleria-mobile` | Diseño responsivo | 301 |
| `muebleria-api` | Endpoints Flask | 149 |
| `muebleria-python` | Código Python | 230 |
| `muebleria-db` | Schema, migraciones | 205 |
| `muebleria-test-ui` | Tests frontend | 210 |
| `muebleria-test-api` | Tests backend | 276 |
| `muebleria-docs` | Documentación | 302 |
| `pull-request` | Git workflow | 295 |
| `skills-creator` | Crear skills | 179 |
| `skills-sync` | Sincronizar | 121 |

**Total:** 2,637 líneas de patrones documentados

---

## 💡 Uso Básico

### Activación Automática

Simplemente pide algo relacionado:

```
"Crea un componente de card de producto"
→ Auto-carga: muebleria-ui + muebleria-react

"Crea endpoint POST /api/ordenes"
→ Auto-carga: muebleria-api + muebleria-python

"Escribe tests para productos"
→ Auto-carga: muebleria-test-api
```

### Activación Manual

```
Read agents/muebleria-ui/SKILL.md
```

---

## 🔥 Ejemplos de Prompts

### Frontend
```
✅ "Crea ProductCard.tsx con imagen, nombre, precio y botón de compra"
✅ "Implementa navegación móvil con hamburger menu"
✅ "Haz el grid de productos responsivo"
```

### Backend
```
✅ "Crea endpoint POST /api/productos con validación"
✅ "Implementa lógica de órdenes con descuento de stock"
✅ "Agrega índices a la tabla productos"
```

### Testing
```
✅ "Escribe tests para el endpoint de órdenes"
✅ "Crea E2E test para el flujo de compra"
✅ "Test que valida stock insuficiente"
```

---

## 📖 Documentación

- **Guía Completa**: `GUIA-SUBAGENTES.md` (20KB)
- **Resumen Ejecutivo**: `RESUMEN-CONFIGURACION.md`
- **Esta guía**: `QUICK-START.md`

---

## 🛠️ Comandos Útiles

```bash
# Sincronizar después de crear/modificar skill
./agents/skill-sync/assets/sync.sh

# Contar skills
find agents/ -name "SKILL.md" | wc -l

# Ver contenido de un skill
cat agents/muebleria-ui/SKILL.md

# Ver skills activos
ls -la .claude/agents/  # o .codex/agents/
```

---

## ❓ FAQ Rápido

**P: ¿Cómo sé si está funcionando?**
R: Pide crear algo y observa si la IA sigue los patrones del proyecto automáticamente.

**P: ¿Debo invocar skills manualmente?**
R: No, el sistema auto-invoca según contexto. Manual solo si necesitas forzar.

**P: ¿Qué pasa si agrego código nuevo?**
R: Si es un patrón repetible, crea un skill o actualiza uno existente.

**P: ¿Cómo actualizo un skill?**
R: Edita el SKILL.md, luego corre `./agents/skill-sync/assets/sync.sh`

**P: ¿Funciona con cualquier IA?**
R: Sí, soporta Claude, Gemini, Codex, Copilot y otras compatibles con Agent Skills.

---

## 🎯 Checklist Inicial

- [ ] Ejecuté `./agents/setup.sh`
- [ ] Reinicié mi IA
- [ ] Verifiqué que existen 12 skills
- [ ] Probé crear un componente
- [ ] La IA siguió los patrones automáticamente
- [ ] Leí GUIA-SUBAGENTES.md (al menos intro)

✅ **Todo listo → Comienza a desarrollar!**

---

## 🚨 Troubleshooting

### Skill no se invoca automáticamente
```bash
# 1. Verificar AGENTS.md
cat AGENTS.md | grep "Auto-invoke"

# 2. Re-sincronizar
./agents/skill-sync/assets/sync.sh

# 3. Reiniciar IA

# 4. Invocar manualmente si persiste
Read agents/{skill-name}/SKILL.md
```

### Symlinks rotos
```bash
# Re-ejecutar setup
./agents/setup.sh --all
```

---

**¿Dudas?** → Lee `GUIA-SUBAGENTES.md` (documentación completa)
