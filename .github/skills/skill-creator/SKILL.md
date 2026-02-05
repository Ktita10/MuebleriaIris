---
name: skill-creator
description: Guía para crear skills efectivas. Esta skill debe usarse 
cuando los usuarios quieran crear una nueva skill (o actualizar una existente) que extienda las capacidades de asistentes de IA con conocimiento especializado, flujos de trabajo o integraciones de herramientas.
---

Creador de Skills
	Esta skill proporciona orientación para crear skills efectivas.

Acerca de las Skills
	Las skills son paquetes modulares y autocontenidos que extienden las 
capacidades de asistentes de IA al proporcionar conocimiento especializado, 
flujos de trabajo y herramientas. Piensa en ellas como "guías de 
incorporación" para dominios o tareas específicas: transforman un agente de 
IA de propósito general en un agente especializado equipado con conocimiento 
procedimental que ningún modelo puede poseer completamente.

Qué Proporcionan las Skills
	Flujos de trabajo especializados - Procedimientos de múltiples pasos para 
dominios específicos
	Integraciones de herramientas - Instrucciones para trabajar con formatos de 
archivo o APIs específicas
	Experiencia en el dominio - Conocimiento específico de la empresa, esquemas, 
lógica de negocio
	Recursos empaquetados - Scripts, referencias y recursos para tareas 
complejas y repetitivas

Principios Fundamentales
Lo Conciso es Clave
	La ventana de contexto es un bien público. Las skills comparten la ventana 
	de contexto con todo lo demás que el asistente de IA necesita: prompt 
	del sistema, historial de conversación, metadatos de otras skills y la 
	solicitud real del usuario.
	
Suposición predeterminada: El asistente de IA ya es muy inteligente. Solo 
añade contexto que no tenga ya. Cuestiona cada pieza de información: 
"¿El asistente realmente necesita esta explicación?" y "¿Este párrafo 
justifica su costo en tokens?"

Prefiere ejemplos concisos sobre explicaciones verbosas.

Establecer Grados de Libertad Apropiados
Ajusta el nivel de especificidad a la fragilidad y variabilidad de la tarea:

Alta libertad (instrucciones basadas en texto): Úsala cuando múltiples 
enfoques sean válidos, las decisiones dependan del contexto o las 
heurísticas guíen el enfoque.
Libertad media (pseudocódigo o scripts con parámetros): Úsala cuando exista 
un patrón preferido, cierta variación sea aceptable o la configuración afecte 
el comportamiento.
Baja libertad (scripts específicos, pocos parámetros): Úsala cuando las 
operaciones sean frágiles y propensas a errores, la consistencia sea crítica o
se deba seguir una secuencia específica.

Piensa en el asistente de IA como explorando un camino: un puente estrecho 
con acantilados necesita barandillas específicas (baja libertad), mientras que
un campo abierto permite muchas rutas (alta libertad).

Anatomía de una Skill
Cada skill consiste en un archivo SKILL.md requerido y recursos empaquetados o
pcionales:

nombre-skill/
├── SKILL.md (requerido)
│   ├── Metadatos frontmatter YAML (requerido)
│   │   ├── name: (requerido)
│   │   └── description: (requerido)
│   └── Instrucciones Markdown (requerido)
└── Recursos Empaquetados (opcional)
    ├── scripts/          - Código ejecutable (Python/Bash/etc.)
    ├── references/       - Documentación destinada a cargarse en contexto según sea necesario
    └── assets/           - Archivos usados en la salida (plantillas, iconos, fuentes, etc.)


El asistente de IA carga FORMS.md, REFERENCE.md o EXAMPLES.md solo cuando es 
necesario.

Patrón 2: Organización específica de dominio
Para Skills con múltiples dominios, organiza el contenido por dominio para 
evitar cargar contexto irrelevante:

bigquery-skill/
├── SKILL.md (resumen y navegación)
└── reference/
    ├── finance.md (ingresos, métricas de facturación)
    ├── sales.md (oportunidades, pipeline)
    ├── product.md (uso de API, características)
    └── marketing.md (campañas, atribución)

Cuando un usuario pregunta sobre métricas de ventas, el asistente solo lee 
sales.md.
De manera similar, para skills que soportan múltiples frameworks o variantes, 
organiza por variante:

cloud-deploy/
├── SKILL.md (flujo de trabajo + selección de proveedor)
└── references/
    ├── aws.md (patrones de despliegue AWS)
    ├── gcp.md (patrones de despliegue GCP)
    └── azure.md (patrones de despliegue Azure)

Cuando el usuario elige AWS, el asistente solo lee aws.md.

Patrón 3: Detalles condicionales
Muestra contenido básico, enlaza a contenido avanzado:
# Procesamiento DOCX

## Crear documentos

Usa docx-js para documentos nuevos. Ver [DOCX-JS.md](DOCX-JS.md).

## Editar documentos

Para ediciones simples, modifica el XML directamente.

**Para control de cambios**: Ver [REDLINING.md](REDLINING.md)
**Para detalles de OOXML**: Ver [OOXML.md](OOXML.md)

El asistente lee REDLINING.md u OOXML.md solo cuando el usuario necesita esas 
características.

Pautas importantes:
	Evitar referencias profundamente anidadas - Mantén las referencias a un nivel 
de profundidad desde SKILL.md. 
Todos los archivos de referencia deben enlazarse directamente desde SKILL.md. 
	Estructurar archivos de referencia más largos - Para archivos de más de 100 
líneas, incluye una tabla de contenidos en la parte superior para que el 
asistente pueda ver el alcance completo al previsualizar.

Proceso de Creación de Skills

La creación de skills involucra estos pasos:
- Comprender la skill con ejemplos concretos
- Planificar contenidos reutilizables de la skill (scripts, referencias, 
	assets)
- Inicializar la skill (ejecutar init_skill.py)
- Editar la skill (implementar recursos y escribir SKILL.md)
- Empaquetar la skill (ejecutar package_skill.py)
- Iterar basándose en el uso real

Sigue estos pasos en orden, omitiendo solo si hay una razón clara por la que 
no son aplicables.

Paso 1: Comprender la Skill con Ejemplos Concretos
Omite este paso solo cuando los patrones de uso de la skill ya estén 
claramente comprendidos. Sigue siendo valioso incluso cuando se trabaja con 
una skill existente.

Para crear una skill efectiva, comprende claramente ejemplos concretos de 
cómo se usará la skill. Esta comprensión puede provenir de ejemplos directos 
del usuario o de ejemplos generados que se validan con retroalimentación del 
usuario.

Por ejemplo, al construir una skill de editor de imágenes, las preguntas 
relevantes incluyen:
- "¿Qué funcionalidad debe soportar la skill de editor de imágenes? ¿Edición,
	 rotación, algo más?"
- "¿Puedes dar algunos ejemplos de cómo se usaría esta skill?"
	"Puedo imaginar que los usuarios pidan cosas como 'Elimina los ojos rojos 
	de esta imagen' o 'Rota esta imagen'. 
	¿Hay otras formas en que imaginas que se usaría esta skill?"
	"¿Qué diría un usuario que debería activar esta skill?"
	
Para evitar abrumar a los usuarios, evita hacer demasiadas preguntas en un 
solo mensaje. Comienza con las preguntas más importantes y haz seguimiento 
según sea necesario para mayor efectividad.
Concluye este paso cuando haya una comprensión clara de la funcionalidad 
que la skill debe soportar.

Paso 2: Planificar los Contenidos Reutilizables de la Skill
Para convertir ejemplos concretos en una skill efectiva, analiza cada ejemplo:
Considerando cómo ejecutar el ejemplo desde cero
Identificando qué scripts, referencias y assets serían útiles al ejecutar 
estos flujos de trabajo repetidamente

Ejemplo: Al construir una skill pdf-editor para manejar consultas como 
"Ayúdame a rotar este PDF," el análisis muestra: Rotar un PDF requiere 
reescribir el mismo código cada vez

Un script scripts/rotate_pdf.py sería útil para almacenar en la skill
Ejemplo: Al diseñar una skill frontend-webapp-builder para consultas como 
"Constrúyeme una app de tareas pendientes" o "Constrúyeme un dashboard para 
rastrear mis pasos," el análisis muestra:
Escribir una webapp frontend requiere el mismo código plantilla HTML/React 
cada vez

Una plantilla assets/hello-world/ que contenga los archivos de proyecto 
HTML/React plantilla sería útil para almacenar en la skill

Ejemplo: Al construir una skill big-query para manejar consultas como 
"¿Cuántos usuarios han iniciado sesión hoy?" el análisis muestra:
Consultar BigQuery requiere redescubrir los esquemas de tablas y relaciones 
cada vez
Un archivo references/schema.md documentando los esquemas de tablas sería útil para almacenar en la skill
Para establecer los contenidos de la skill, analiza cada ejemplo concreto 
para crear una lista de los recursos reutilizables a incluir: scripts, 
referencias y assets.

Paso 3: Inicializar la Skill
	En este punto, es momento de crear realmente la skill.
Omite este paso solo si la skill que se está desarrollando ya existe, y se 
necesita iteración o empaquetado. En este caso, continúa al siguiente paso.
Al crear una nueva skill desde cero, ejecuta siempre el script init_skill.py.
El script genera convenientemente un nuevo directorio de skill plantilla que 
incluye automáticamente todo lo que una skill requiere, haciendo el proceso 
de creación de skills mucho más eficiente y confiable.
Uso:
scripts/init_skill.py <nombre-skill> --path <directorio-salida>

El script:
	Crea el directorio de la skill en la ruta especificadaGenera una plantilla SKILL.md con frontmatter apropiado y marcadores de posición TODOCrea directorios de recursos de ejemplo: scripts/, references/ y assets/Añade archivos de ejemplo en cada directorio que pueden personalizarse o eliminarse
Después de la inicialización, personaliza o elimina los archivos de ejemplo y SKILL.md generados según sea necesario.

Paso 4: Editar la Skill
	Al editar la skill (recién generada o existente), recuerda que la skill se 
	está creando para que otra instancia del asistente de IA la use. 
	Incluye información que sería beneficiosa y no obvia para el asistente. 
	Considera qué conocimiento procedimental, detalles específicos del dominio 
	o assets reutilizables ayudarían a otra instancia del asistente a ejecutar 
	estas tareas de manera más efectiva.
	
Aprender Patrones de Diseño Probados
Consulta estas guías útiles según las necesidades de tu skill:

Procesos de múltiples pasos: Ver references/workflows.md para flujos de 
trabajo secuenciales y lógica condicional

Formatos de salida específicos o estándares de calidad: Ver 
references/output-patterns.md para patrones de plantillas y ejemplos

Estos archivos contienen mejores prácticas establecidas para diseño efectivo 
de skills.

Paso 5: Iterar
Después de probar la skill, los usuarios pueden solicitar mejoras. 
A menudo esto ocurre justo después de usar la skill, con contexto fresco de 
cómo se desempeñó la skill.

Flujo de trabajo de iteración:
Usar la skill en tareas reales
Notar dificultades o ineficiencias
Identificar cómo SKILL.md o los recursos empaquetados deberían actualizarse
Implementar cambios y probar nuevamente