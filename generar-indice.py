#!/usr/bin/env python3
"""
GENERADOR AUTOMÁTICO DE ÍNDICE QSL Y DIPLOMAS
==============================================
Ejecuta este script en la carpeta raíz de tu sitio web.
Escaneará las carpetas /qsl y /diplomas y generará el código JS.

USO:
  python generar-indice.py

ESTRUCTURA ESPERADA:
  /tu-sitio-web/
    /qsl/
      /actividad-2024/
        QSL_CE4JWI_2024-03-15.jpg
        QSL_CA3ABC_2024-03-15.jpg
      /contest-2023/
        QSL_CE4JWI_2023-11-10.jpg
    /diplomas/
      /contest-2024/
        DIPLOMA_CE4JWI_2024-06-01.jpg
    generar-indice.py  <-- este script
    qsl-portal.html
"""

import os
import re
from datetime import datetime

# Configuración
QSL_FOLDER = "qsl"
DIPLOMAS_FOLDER = "diplomas"
EXTENSIONES_VALIDAS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'}

def extraer_indicativo(nombre_archivo):
    """Extrae el indicativo del nombre del archivo."""
    # Patrones comunes: QSL_CE4JWI_2024.jpg, CE4JWI-diploma.jpg, etc.
    patrones = [
        r'[_\-]([A-Z]{1,2}[0-9][A-Z]{1,4})[_\-\.]',  # _CE4JWI_ o -CE4JWI-
        r'^([A-Z]{1,2}[0-9][A-Z]{1,4})[_\-\.]',       # CE4JWI_ al inicio
        r'[_\-]([A-Z]{1,2}[0-9][A-Z]{1,4})$',         # _CE4JWI al final (sin extensión)
    ]
    
    nombre_sin_ext = os.path.splitext(nombre_archivo)[0].upper()
    
    for patron in patrones:
        match = re.search(patron, nombre_sin_ext)
        if match:
            return match.group(1)
    
    # Buscar cualquier patrón de indicativo en el nombre
    match = re.search(r'([A-Z]{1,2}[0-9][A-Z]{1,4})', nombre_sin_ext)
    if match:
        return match.group(1)
    
    return None

def extraer_fecha(nombre_archivo):
    """Extrae la fecha del nombre del archivo."""
    patrones_fecha = [
        (r'(\d{4})-(\d{2})-(\d{2})', '%Y-%m-%d'),      # 2024-03-15
        (r'(\d{4})(\d{2})(\d{2})', '%Y%m%d'),          # 20240315
        (r'(\d{2})-(\d{2})-(\d{4})', '%d-%m-%Y'),      # 15-03-2024
        (r'(\d{4})', '%Y'),                             # Solo año 2024
    ]
    
    for patron, formato in patrones_fecha:
        match = re.search(patron, nombre_archivo)
        if match:
            try:
                if len(match.groups()) == 3:
                    fecha_str = '-'.join(match.groups())
                    if formato == '%Y%m%d':
                        fecha_str = f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
                        formato = '%Y-%m-%d'
                    elif formato == '%d-%m-%Y':
                        fecha_str = f"{match.group(3)}-{match.group(2)}-{match.group(1)}"
                        formato = '%Y-%m-%d'
                else:
                    fecha_str = match.group(1) + "-01-01"
                    formato = '%Y-%m-%d'
                
                datetime.strptime(fecha_str.split('-')[0] + '-' + fecha_str.split('-')[1] + '-' + fecha_str.split('-')[2][:2], '%Y-%m-%d')
                return fecha_str[:10]
            except:
                continue
    
    return datetime.now().strftime('%Y-%m-%d')

def escanear_carpeta(carpeta_base, tipo):
    """Escanea una carpeta y sus subcarpetas buscando archivos."""
    archivos = []
    
    if not os.path.exists(carpeta_base):
        print(f"  Carpeta '{carpeta_base}' no encontrada. Se creará vacía.")
        return archivos
    
    for root, dirs, files in os.walk(carpeta_base):
        # Obtener nombre de la actividad (subcarpeta)
        ruta_relativa = os.path.relpath(root, carpeta_base)
        actividad = ruta_relativa if ruta_relativa != '.' else os.path.basename(carpeta_base)
        actividad = actividad.replace('-', ' ').replace('_', ' ').title()
        
        for archivo in files:
            extension = os.path.splitext(archivo)[1].lower()
            if extension not in EXTENSIONES_VALIDAS:
                continue
            
            indicativo = extraer_indicativo(archivo)
            if not indicativo:
                print(f"  ADVERTENCIA: No se pudo extraer indicativo de '{archivo}'")
                continue
            
            fecha = extraer_fecha(archivo)
            ruta_completa = os.path.join(root, archivo).replace('\\', '/')
            
            archivos.append({
                'callsign': indicativo,
                'file': ruta_completa,
                'date': fecha,
                'activity': actividad
            })
    
    return archivos

def generar_js(qsl_cards, diplomas):
    """Genera el código JavaScript con los arrays."""
    
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
    """Formatea un array de items como código JS legible."""
    if not items:
        return "[]"
    
    lineas = ["["]
    for item in items:
        lineas.append('  {')
        lineas.append(f'    callsign: "{item["callsign"]}",')
        lineas.append(f'    file: "{item["file"]}",')
        lineas.append(f'    date: "{item["date"]}",')
        lineas.append(f'    activity: "{item["activity"]}"')
        lineas.append('  },')
    lineas.append("]")
    
    return '\n'.join(lineas)

def main():
    print("=" * 50)
    print("GENERADOR DE ÍNDICE QSL Y DIPLOMAS")
    print("=" * 50)
    print()
    
    # Escanear carpetas
    print(f"Escaneando carpeta '{QSL_FOLDER}'...")
    qsl_cards = escanear_carpeta(QSL_FOLDER, 'qsl')
    print(f"  Encontradas: {len(qsl_cards)} QSL cards")
    
    print(f"\nEscaneando carpeta '{DIPLOMAS_FOLDER}'...")
    diplomas = escanear_carpeta(DIPLOMAS_FOLDER, 'diploma')
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
    print(f"ARCHIVO GENERADO: {output_file}")
    print("=" * 50)
    print()
    print("INSTRUCCIONES:")
    print("1. Abre el archivo 'datos-generados.js'")
    print("2. Copia todo el contenido")
    print("3. Pégalo en la sección 'BASE DE DATOS' del archivo qsl-portal.html")
    print("   (reemplaza los arrays qslCards y diplomas existentes)")
    print()
    
    # Mostrar indicativos encontrados
    indicativos = set()
    for item in qsl_cards + diplomas:
        indicativos.add(item['callsign'])
    
    if indicativos:
        print(f"Indicativos encontrados ({len(indicativos)}):")
        print(", ".join(sorted(indicativos)))

if __name__ == "__main__":
    main()
