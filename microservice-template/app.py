from flask import Flask, request, jsonify
import requests
import os
import json
from datetime import datetime
import logging

# Configuración
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Variables de entorno
ROBLE_BASE_HOST = os.getenv('ROBLE_BASE_HOST', 'https://roble-api.openlab.uninorte.edu.co')
ROBLE_CONTRACT = os.getenv('ROBLE_CONTRACT', 'microservices_roble_e65ac352d7')
SERVICE_NAME = os.getenv('SERVICE_NAME', 'template-service')
SERVICE_PORT = int(os.getenv('SERVICE_PORT', 5000))

class RobleIntegration:
    """Cliente para integración con ROBLE"""
    
    def __init__(self, base_url, db_name):
        self.base_url = base_url
        self.db_name = db_name
        self.auth_url = f"{base_url}/auth/{db_name}"
        self.db_url = f"{base_url}/database/{db_name}"
    
    def verify_token(self, token):
        """Verificar token de autenticación"""
        try:
            response = requests.get(
                f"{self.auth_url}/verify-token",
                headers={'Authorization': f'Bearer {token}'}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error verificando token: {e}")
            return None
    
    def get_table_data(self, token, table_name, filters=None):
        """Obtener datos de una tabla"""
        try:
            params = {'tableName': table_name}
            if filters:
                params.update(filters)
            
            response = requests.get(
                f"{self.db_url}/read",
                headers={'Authorization': f'Bearer {token}'},
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error obteniendo datos: {e}")
            return None
    
    def insert_data(self, token, table_name, records):
        """Insertar datos en una tabla"""
        try:
            response = requests.post(
                f"{self.db_url}/insert",
                headers={'Authorization': f'Bearer {token}'},
                json={'tableName': table_name, 'records': records}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error insertando datos: {e}")
            return None
    
    def update_data(self, token, table_name, id_column, id_value, updates):
        """Actualizar un registro específico"""
        try:
            response = requests.put(
                f"{self.db_url}/update",
                headers={'Authorization': f'Bearer {token}'},
                json={
                    'tableName': table_name,
                    'idColumn': id_column,
                    'idValue': id_value,
                    'updates': updates
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error actualizando datos: {e}")
            return None
    
    def delete_data(self, token, table_name, id_column, id_value):
        """Eliminar un registro específico"""
        try:
            response = requests.delete(
                f"{self.db_url}/delete",
                headers={'Authorization': f'Bearer {token}'},
                json={
                    'tableName': table_name,
                    'idColumn': id_column,
                    'idValue': id_value
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logging.error(f"Error eliminando datos: {e}")
            return None

# Instancia de integración ROBLE
roble = RobleIntegration(ROBLE_BASE_HOST, ROBLE_CONTRACT)

def authenticate_request(f):
    """Decorator para autenticación"""
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de autorización requerido'}), 401
        
        token = auth_header.split(' ')[1]
        user_data = roble.verify_token(token)
        
        if not user_data:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        request.user = user_data
        request.token = token
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servicio"""
    return jsonify({
        'service': SERVICE_NAME,
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'roble_connection': 'ok' if roble else 'error'
    })

@app.route('/api/info', methods=['GET'])
@authenticate_request
def service_info():
    """Información del microservicio"""
    return jsonify({
        'service_name': SERVICE_NAME,
        'version': '1.0.0',
        'description': 'Microservicio template con integración ROBLE',
        'endpoints': [
            '/health',
            '/api/info',
            '/api/process',
            '/api/data-filter',
            '/api/data-aggregation'
        ],
        'user': request.user.get('email', 'unknown'),
        'roble_database': ROBLE_CONTRACT
    })

@app.route('/api/process', methods=['POST'])
@authenticate_request
def process_data():
    """Procesamiento genérico de datos"""
    try:
        data = request.get_json() or {}
        processing_type = data.get('type', 'basic')
        input_data = data.get('data', [])
        
        logging.info(f"Procesando datos tipo: {processing_type}")
        
        # Simular diferentes tipos de procesamiento
        if processing_type == 'filter':
            # Filtrar datos por criterio
            criteria = data.get('criteria', {})
            result = filter_data(input_data, criteria)
        
        elif processing_type == 'aggregate':
            # Agregar datos
            result = aggregate_data(input_data)
        
        elif processing_type == 'analyze':
            # Análisis básico
            result = analyze_data(input_data)
        
        else:
            # Procesamiento básico
            result = {
                'processed_count': len(input_data),
                'processing_type': processing_type,
                'timestamp': datetime.now().isoformat(),
                'sample': input_data[:3] if input_data else []
            }
        
        return jsonify({
            'success': True,
            'service': SERVICE_NAME,
            'processing_type': processing_type,
            'user': request.user.get('email'),
            'result': result
        })
        
    except Exception as e:
        logging.error(f"Error procesando datos: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/data-filter', methods=['POST'])
@authenticate_request
def filter_roble_data():
    """Filtrar datos de ROBLE"""
    try:
        data = request.get_json() or {}
        table_name = data.get('table', 'usuarios')  # tabla por defecto
        filters = data.get('filters', {})
        
        # Obtener datos de ROBLE
        roble_data = roble.get_table_data(request.token, table_name, filters)
        
        if roble_data is None:
            return jsonify({'error': 'Error consultando ROBLE'}), 500
        
        # Aplicar filtros adicionales si es necesario
        filtered_data = apply_custom_filters(roble_data, data.get('custom_filters', {}))
        
        return jsonify({
            'success': True,
            'service': SERVICE_NAME,
            'table': table_name,
            'total_records': len(filtered_data),
            'data': filtered_data,
            'filters_applied': filters,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logging.error(f"Error filtrando datos ROBLE: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/data-aggregation', methods=['POST'])
@authenticate_request
def aggregate_roble_data():
    """Agregar datos de ROBLE"""
    try:
        data = request.get_json() or {}
        table_name = data.get('table', 'usuarios')
        aggregation_type = data.get('aggregation', 'count')
        
        # Obtener datos de ROBLE
        roble_data = roble.get_table_data(request.token, table_name)
        
        if roble_data is None:
            return jsonify({'error': 'Error consultando ROBLE'}), 500
        
        # Realizar agregación
        if aggregation_type == 'count':
            result = {'total_count': len(roble_data)}
        
        elif aggregation_type == 'group_by':
            group_field = data.get('group_field', '_id')
            result = group_by_field(roble_data, group_field)
        
        elif aggregation_type == 'summary':
            result = generate_summary(roble_data)
        
        else:
            result = {'message': 'Tipo de agregación no soportado'}
        
        return jsonify({
            'success': True,
            'service': SERVICE_NAME,
            'table': table_name,
            'aggregation_type': aggregation_type,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logging.error(f"Error agregando datos ROBLE: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/api/crud', methods=['POST'])
@authenticate_request
def crud_operations():
    """Operaciones CRUD completas en ROBLE"""
    try:
        data = request.get_json() or {}
        operation = data.get('operation')  # 'create', 'read', 'update', 'delete'
        table_name = data.get('table', 'usuarios')
        
        if operation == 'create':
            records = data.get('records', [])
            result = roble.insert_data(request.token, table_name, records)
            
        elif operation == 'read':
            filters = data.get('filters', {})
            result = roble.get_table_data(request.token, table_name, filters)
            
        elif operation == 'update':
            id_column = data.get('idColumn', '_id')
            id_value = data.get('idValue')
            updates = data.get('updates', {})
            result = roble.update_data(request.token, table_name, id_column, id_value, updates)
            
        elif operation == 'delete':
            id_column = data.get('idColumn', '_id')
            id_value = data.get('idValue')
            result = roble.delete_data(request.token, table_name, id_column, id_value)
            
        else:
            return jsonify({'error': 'Operación no válida'}), 400
        
        if result is None:
            return jsonify({'error': 'Error ejecutando operación ROBLE'}), 500
        
        return jsonify({
            'success': True,
            'service': SERVICE_NAME,
            'operation': operation,
            'table': table_name,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logging.error(f"Error en operación CRUD: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

# Funciones auxiliares de procesamiento
def filter_data(data, criteria):
    """Filtrar datos según criterios"""
    if not criteria:
        return data
    
    filtered = []
    for item in data:
        match = True
        for key, value in criteria.items():
            if key not in item or item[key] != value:
                match = False
                break
        if match:
            filtered.append(item)
    
    return filtered

def aggregate_data(data):
    """Agregar datos básicos"""
    if not data:
        return {'count': 0}
    
    return {
        'count': len(data),
        'sample': data[0] if data else None,
        'keys': list(data[0].keys()) if data else []
    }

def analyze_data(data):
    """Análisis básico de datos"""
    if not data:
        return {'message': 'No hay datos para analizar'}
    
    return {
        'total_records': len(data),
        'data_types': get_data_types(data[0] if data else {}),
        'sample_record': data[0] if data else None
    }

def apply_custom_filters(data, custom_filters):
    """Aplicar filtros personalizados"""
    # Implementar lógica de filtros personalizados
    return data  # Por ahora retorna sin filtrar

def group_by_field(data, field):
    """Agrupar datos por campo"""
    groups = {}
    for item in data:
        key = item.get(field, 'unknown')
        if key not in groups:
            groups[key] = []
        groups[key].append(item)
    
    return {
        'groups': {k: len(v) for k, v in groups.items()},
        'total_groups': len(groups)
    }

def generate_summary(data):
    """Generar resumen de datos"""
    if not data:
        return {'message': 'No hay datos'}
    
    return {
        'total_records': len(data),
        'fields': list(data[0].keys()) if data else [],
        'first_record': data[0] if data else None,
        'last_record': data[-1] if data else None
    }

def get_data_types(record):
    """Obtener tipos de datos de un registro"""
    return {k: type(v).__name__ for k, v in record.items()}

if __name__ == '__main__':
    logging.info(f"🚀 Iniciando {SERVICE_NAME} en puerto {SERVICE_PORT}")
    logging.info(f"🔗 ROBLE: {ROBLE_BASE_HOST}/auth/{ROBLE_CONTRACT}")
    
    app.run(
        host='0.0.0.0', 
        port=SERVICE_PORT, 
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )