# 🎨 Guía de Estilos - Paleta y UI

## 🎯 Colores Principales

- **Primario:** `indigo-600` → Botones principales, administración
- **Secundario:** `emerald-500` → Estados de éxito, compras/ventas

## 🎨 Paleta Tailwind

### Fondos
- **Gradiente principal:** `from-slate-900 via-slate-800 to-slate-900`
- **Tarjetas glassmorphism:** `bg-white/10 border-white/20 shadow-2xl`
- **Tarjetas internas:** `bg-slate-800 border-slate-700`

### Textos
- Principal: `text-white`
- Secundario: `text-slate-300`
- Labels: `text-slate-200`
- Placeholders: `text-slate-400`

### Inputs
```
bg-slate-800 text-white placeholder-slate-400 
border-slate-700 focus:ring-2 focus:ring-indigo-500
```

### Botones
- **Primario:** `bg-indigo-600 hover:bg-indigo-500 text-white`
- **Secundario:** `bg-emerald-500 hover:bg-emerald-400 text-white`
- **Neutro:** `bg-slate-800 hover:bg-slate-700 text-white border-slate-700`

## 🖼️ Patrones de UI

### Tarjetas de Navegación
```
rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6
hover:border-indigo-500 hover:bg-slate-800
transition-all duration-300 shadow-xl hover:shadow-indigo-500/20
```
- Iconos grandes (w-10 h-10) en círculos con color temático
- Efecto glow: `bg-indigo-500/10 blur-lg`
- Hover con escala: `group-hover:scale-110`

### Headers de Sección
```
<div className="flex items-center gap-3">
  <div className="bg-indigo-600 rounded-lg p-2">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <div>
    <h3 className="text-xl font-bold text-white">Título</h3>
    <p className="text-slate-300 text-sm">Descripción</p>
  </div>
</div>
```

### Botones de Acción Grandes
```
w-full py-4 bg-indigo-600 hover:bg-indigo-500 
text-white rounded-lg font-bold text-lg 
flex items-center justify-center gap-3 
shadow-lg hover:shadow-indigo-500/30 transition-all
```

## 🧩 Iconos (Lucide React)

- **Stock:** `Package`, `Box`, `Warehouse`
- **Movimientos:** `ArrowRight`, `ArrowLeftRight`, `RefreshCw`
- **Compras:** `ShoppingCart`, `ShoppingBag`
- **Historial:** `History`, `Calendar`, `FileText`
- **Ubicaciones:** `Store`, `MapPin`
- **Acciones:** `Plus`, `Edit`, `Trash`, `Save`, `X`
- **Navegación:** `ChevronLeft`, `ChevronRight`
- **Estados:** `CheckCircle`, `XCircle`, `AlertCircle`

## 📐 Espaciado

- Contenedores: `p-8`
- Secciones: `space-y-8` o `gap-8`
- Elementos: `space-y-4` o `gap-4`
- Bordes: `rounded-xl` (tarjetas), `rounded-lg` (botones)

## ✨ Efectos

- **Transiciones:** `transition-all duration-300`
- **Hover escala:** `group-hover:scale-110`
- **Glassmorphism:** `backdrop-blur-md`
- **Glow:** `absolute inset-0 bg-indigo-500/10 blur-lg`

## 📚 Librerías

- **Iconos:** lucide-react
- **Formularios:** react-hook-form
- **Números:** react-number-format
- **Fechas:** date-fns (usar UTC)
- **Tablas:** @tanstack/react-table
- **UI:** shadcn/ui

## 💡 Reglas de Oro

1. **Indigo** para acciones principales y administración
2. **Emerald** para éxito y compras
3. Fondos oscuros (`slate-800/900`) para contraste
4. Tarjetas grandes e interactivas para navegación
5. Headers con icono + título + descripción
6. Botones de acción grandes (py-4) con iconos
7. Siempre incluir estados hover y disabled
8. Grid responsive: `md:grid-cols-2`
9. Fuente: **Inter** (default Tailwind)

bien pero me lo estas dando separado damelo todo para copiar de una
markdown

# 🎨 Guía de Estilos - Paleta y UI

## 🎯 Colores Principales

- **Primario:** `indigo-600` → Botones principales, administración
- **Secundario:** `emerald-500` → Estados de éxito, compras/ventas

## 🎨 Paleta Tailwind

### Fondos
- **Gradiente principal:** `from-slate-900 via-slate-800 to-slate-900`
- **Tarjetas glassmorphism:** `bg-white/10 border-white/20 shadow-2xl`
- **Tarjetas internas:** `bg-slate-800 border-slate-700`

### Textos
- Principal: `text-white`
- Secundario: `text-slate-300`
- Labels: `text-slate-200`
- Placeholders: `text-slate-400`

### Inputs
```
bg-slate-800 text-white placeholder-slate-400 
border-slate-700 focus:ring-2 focus:ring-indigo-500
```

### Botones
- **Primario:** `bg-indigo-600 hover:bg-indigo-500 text-white`
- **Secundario:** `bg-emerald-500 hover:bg-emerald-400 text-white`
- **Neutro:** `bg-slate-800 hover:bg-slate-700 text-white border-slate-700`

## 🖼️ Patrones de UI

### Tarjetas de Navegación
```
rounded-xl border-2 border-slate-700 bg-slate-800/80 p-6
hover:border-indigo-500 hover:bg-slate-800
transition-all duration-300 shadow-xl hover:shadow-indigo-500/20
```
- Iconos grandes (w-10 h-10) en círculos con color temático
- Efecto glow: `bg-indigo-500/10 blur-lg`
- Hover con escala: `group-hover:scale-110`

### Headers de Sección
```
<div className="flex items-center gap-3">
  <div className="bg-indigo-600 rounded-lg p-2">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <div>
    <h3 className="text-xl font-bold text-white">Título</h3>
    <p className="text-slate-300 text-sm">Descripción</p>
  </div>
</div>
```

### Botones de Acción Grandes
```
w-full py-4 bg-indigo-600 hover:bg-indigo-500 
text-white rounded-lg font-bold text-lg 
flex items-center justify-center gap-3 
shadow-lg hover:shadow-indigo-500/30 transition-all
```

## 🧩 Iconos (Lucide React)

- **Stock:** `Package`, `Box`, `Warehouse`
- **Movimientos:** `ArrowRight`, `ArrowLeftRight`, `RefreshCw`
- **Compras:** `ShoppingCart`, `ShoppingBag`
- **Historial:** `History`, `Calendar`, `FileText`
- **Ubicaciones:** `Store`, `MapPin`
- **Acciones:** `Plus`, `Edit`, `Trash`, `Save`, `X`
- **Navegación:** `ChevronLeft`, `ChevronRight`
- **Estados:** `CheckCircle`, `XCircle`, `AlertCircle`

## 📐 Espaciado

- Contenedores: `p-8`
- Secciones: `space-y-8` o `gap-8`
- Elementos: `space-y-4` o `gap-4`
- Bordes: `rounded-xl` (tarjetas), `rounded-lg` (botones)

## ✨ Efectos

- **Transiciones:** `transition-all duration-300`
- **Hover escala:** `group-hover:scale-110`
- **Glassmorphism:** `backdrop-blur-md`
- **Glow:** `absolute inset-0 bg-indigo-500/10 blur-lg`

## 📚 Librerías

- **Iconos:** lucide-react
- **Formularios:** react-hook-form
- **Números:** react-number-format
- **Fechas:** date-fns (usar UTC)
- **Tablas:** @tanstack/react-table
- **UI:** shadcn/ui

## 💡 Reglas de Oro

1. **Indigo** para acciones principales y administración
2. **Emerald** para éxito y compras
3. Fondos oscuros (`slate-800/900`) para contraste
4. Tarjetas grandes e interactivas para navegación
5. Headers con icono + título + descripción
6. Botones de acción grandes (py-4) con iconos
7. Siempre incluir estados hover y disabled
8. Grid responsive: `md:grid-cols-2`
9. Fuente: **Inter** (default Tailwind)

PSyshg