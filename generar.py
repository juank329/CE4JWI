#!/usr/bin/env python3
"""
GENERADOR AUTOMÁTICO DE ÍNDICE QSL Y DIPLOMAS (VERSIÓN CORREGIDA)
================================================================
Ejecuta este script en la carpeta raíz de tu sitio web.
Escaneará las carpetas /qsl y /diplomas y generará el código JS.
Mantiene las fechas reales de los archivos antiguos si no tienen fecha en el nombre.
"""

import os
import re
from datetime import datetime

# Configuración
QSL_FOLDER = "qsl"
DIPLOMAS_FOLDER = "diplomas"
EXTENSIONES_VALIDAS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'}

def extraer_indicativo(nombre_archivo):
    """Extrae el indicativo del nombre del archivo de forma segura."""
    patrones = [
        r'[_\-]([A-Z]{1,2}[0-9][A-Z]{1,4})[_\-\.]',  # _CE4JWI_ o -CE4JWI-
        r'^([A-Z]{1,2}[0-9][A-Z]{1,4})[_\-\.]',       # CE4JWI_ al inicio
        r'[_\-]([A-Z]{1,2}[0-9][A-Z]{1,4})$',         # _CE4JWI al final (sin extensión)
    ]
    
    # Corregido: Obtener solo el nombre sin extensión antes de pasar a mayúsculas
    nombre_sin_ext = os.path.splitext(nombre_archivo)[0].upper()
    
    for patron in patrones:
        match = re.search(patron, nombre_sin_ext)
        if match:
            return match.group(1)
    
    # Buscar cualquier patrón de indicativo en el nombre si los anteriores fallan
    match = re.search(r'([A-Z]{1,2}[0-9][A-Z]{1,4})', nombre_sin_ext)
    if match:
        return match.group(1)
    
    return None

def extraer_fecha(nombre_archivo, ruta_completa):
    """
    Extrae la fecha del nombre del archivo. 
    Si no tiene fecha en el nombre, extrae la fecha de modificación real del archivo en el sistema.
    """
    # 1. Intentar buscar formatos de fecha comunes en el nombre del archivo
    match_iso = re.search(r'(\d{4})-(\d{2})-(\d{2})', nombre_archivo)
    if match_iso:
        return match_iso.group(0)
        
    match_pure = re.search(r'(\d{4})(\d{2})(\d{2})', nombre_archivo)
    if match_pure:
        return f"{match_pure.group(1)}-{match_pure.group(2)}-{match_pure.group(3)}"
        
    match_es = re.search(r'(\d{2})-(\d{2})-(\d{4})', nombre_archivo)
    if match_es:
        return f"{match_es.group(3)}-{match_es.group(2)}-{match_es.group(1)}"
        
    match_year = re.search(r'(\d{4})', nombre_archivo)
    if match_year:
        return f"{match_year.group(1)}-01-01"
    
    # 2. RESPALDO CRÍTICO: Si no hay fecha en el nombre, lee la fecha original del archivo en el disco
    try:
        timestamp = os.path.getmtime(ruta_completa)
        fecha_sistema = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
        return fecha_sistema
    except Exception:
        return datetime.now().strftime('%Y-%m-%d')

def escanear_carpeta(carpeta_base):
    """Escanea una carpeta y sus subcarpetas buscando archivos."""
    archivos = []
    
    if not os.path.exists(carpeta_base):
        print(f"  Carpeta '{carpeta_base}' no encontrada. Se saltará.")
        return archivos
    
    for root, dirs, files in os.walk(carpeta_base):
        ruta_relativa = os.path.relpath(root, carpeta_base)
        
        if ruta_relativa == '.':
            actividad = os.path.basename(carpeta_base)
        else:
            actividad = ruta_relativa
            
        actividad = actividad.replace('-', ' ').replace('_', ' ').title()
        
        for archivo in files:
            extension = os.path.splitext(archivo)[1].lower()
            if extension not in EXTENSIONES_VALIDAS:
                continue
            
            # Construir la ruta física del sistema para validar su fecha real
            ruta_sistema = os.path.join(root, archivo)
            
            indicativo = extraer_indicativo(archivo)
            if not indicativo:
                print(f"  ADVERTENCIA: No se pudo extraer indicativo de '{archivo}'")
                continue
            
            fecha = extraer_fecha(archivo, ruta_sistema)
            ruta_web = ruta_sistema.replace('\\', '/')
            
            archivos.append({
                'callsign': indicativo,
                'file': ruta_web,
                'date': fecha,
                'activity': actividad
            })
    
    return archivos

def generar_js(qsl_cards, diplomas):
    """Genera el código JavaScript final limpio y sin comas huérfanas."""
    js_code = """// ========================================
// ARCHIVO GENERADO AUTOMÁTICAMENTE
// Generado el: {fecha}
// Total QSL Cards: {total_qsl}
// Total Diplomas: {total_diplomas}
// ========================================

const qslCards = {qsl_json};

const diplomas = {diplomas_json};
""".format(
        fecha=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        total_qsl=len(qsl_cards),
        total_diplomas=len(diplomas),
        qsl_json=formato_array_js(qsl_cards),
        diplomas_json=formato_array_js(diplomas)
    )
    
    return js_code

def formato_array_js(items):
    """Formatea un array de ítems como código JS con sintaxis moderna y válida."""
    if not items:
        return "[]"
    
    bloques = []
    for item in items:
        bloque = (
            "  {\n"
            f'    callsign: "{item["callsign"]}",\n'
            f'    file: "{item["file"]}",\n'
            f'    date: "{item["date"]}",\n'
            f'    activity: "{item["activity"]}"\n'
            "  }"
        )
        bloques.append(bloque)
        
    return "[\n" + ",\n".join(bloques) + "\n]"

def main():
    print("=" * 50)
    print("GENERADOR DE ÍNDICE QSL Y DIPLOMAS (REPARADO)")
    print("=" * 50)
    print()
    
    # Escanear carpetas
    print(f"Escaneando carpeta '{QSL_FOLDER}'...")
    qsl_cards = escanear_carpeta(QSL_FOLDER)
    print(f"  Encontradas: {len(qsl_cards)} QSL cards")
    
    print(f"\nEscaneando carpeta '{DIPLOMAS_FOLDER}'...")
    diplomas = escanear_carpeta(DIPLOMAS_FOLDER)
    print(f"  Encontrados: {len(diplomas)} diplomas")
    
    # Ordenar por fecha (más reciente primero)
    qsl_cards.sort(key=lambda x: x['date'], reverse=True)
    diplomas.sort(key=lambda x: x['date'], reverse=True)
    
    # Generar código JS
    js_code = generar_js(qsl_cards, diplomas)
    
    # Guardar archivo
    output_file = "datos-generados.js"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print()
    print("=" * 50)
    print(f"ARCHIVO GENERADO CON ÉXITO: {output_file}")
    print("=" * 50)
    print()
    
    # Mostrar resumen de indicativos encontrados
    indicativos = {item['callsign'] for item in qsl_cards + diplomas}
    if indicativos:
        print(f"Indicativos listados para el buscador ({len(indicativos)}):")
        print(", ".join(sorted(indicativos)))

if __name__ == "__main__":
    main()
