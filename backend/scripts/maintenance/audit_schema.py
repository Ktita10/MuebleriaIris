#!/usr/bin/env python3
"""
Database Schema Audit Script
Compares SQLAlchemy models with actual PostgreSQL schema to detect missing columns.
"""

import os
import sys
from sqlalchemy import create_engine, inspect, MetaData
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database connection details
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '5432')
DB_NAME = os.environ.get('DB_NAME', 'muebleria_erp')

DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

# Import models after setting up path
sys.path.insert(0, os.path.dirname(__file__))
from app import db
from app.models import (
    Usuario, Cliente, Proveedor, Producto, 
    Inventario, Orden, DetalleOrden, Pago
)


def audit_schema():
    """Compare SQLAlchemy models with actual database schema."""
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    inspector = inspect(engine)
    
    # Get actual database tables
    actual_tables = inspector.get_table_names()
    
    print("=" * 80)
    print("DATABASE SCHEMA AUDIT REPORT")
    print("=" * 80)
    print(f"\nDatabase: {DB_NAME}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print(f"User: {DB_USER}\n")
    
    # Models to audit (using actual table names from models.py)
    models = [
        ('usuarios', Usuario),
        ('clientes', Cliente),
        ('proovedores', Proveedor),  # Note: typo in database schema
        ('productos', Producto),
        ('inventario', Inventario),
        ('ordenes', Orden),
        ('detalles_orden', DetalleOrden),  # Note: plural in database
        ('pagos', Pago),
    ]
    
    issues_found = False
    
    for table_name, model_class in models:
        print(f"\n{'=' * 80}")
        print(f"TABLE: {table_name}")
        print('=' * 80)
        
        # Check if table exists
        if table_name not in actual_tables:
            print(f"❌ ERROR: Table '{table_name}' does NOT exist in database!")
            issues_found = True
            continue
        
        # Get columns from model
        model_columns = {}
        for column in model_class.__table__.columns:
            model_columns[column.name] = {
                'type': str(column.type),
                'nullable': column.nullable,
                'default': column.default,
                'primary_key': column.primary_key
            }
        
        # Get columns from actual database
        actual_columns = {}
        for column in inspector.get_columns(table_name):
            actual_columns[column['name']] = {
                'type': str(column['type']),
                'nullable': column['nullable'],
                'default': column['default'],
            }
        
        # Compare columns
        model_col_names = set(model_columns.keys())
        actual_col_names = set(actual_columns.keys())
        
        # Columns in model but not in database
        missing_in_db = model_col_names - actual_col_names
        if missing_in_db:
            print(f"\n⚠️  MISSING IN DATABASE ({len(missing_in_db)} columns):")
            issues_found = True
            for col_name in sorted(missing_in_db):
                col_info = model_columns[col_name]
                print(f"   - {col_name}")
                print(f"     Type: {col_info['type']}")
                print(f"     Nullable: {col_info['nullable']}")
                print(f"     Default: {col_info['default']}")
        
        # Columns in database but not in model
        extra_in_db = actual_col_names - model_col_names
        if extra_in_db:
            print(f"\n📋 EXTRA IN DATABASE ({len(extra_in_db)} columns):")
            for col_name in sorted(extra_in_db):
                col_info = actual_columns[col_name]
                print(f"   - {col_name}")
                print(f"     Type: {col_info['type']}")
                print(f"     Nullable: {col_info['nullable']}")
        
        # Columns in both - check for type mismatches
        common_columns = model_col_names & actual_col_names
        type_mismatches = []
        for col_name in common_columns:
            model_type = str(model_columns[col_name]['type']).upper()
            actual_type = str(actual_columns[col_name]['type']).upper()
            
            # Normalize type names for comparison
            model_type_normalized = (
                model_type
                .replace('VARCHAR', 'CHARACTER VARYING')
                .replace('INTEGER', 'INT')
                .replace('DATETIME', 'TIMESTAMP')
            )
            
            actual_type_normalized = (
                actual_type
                .replace('CHARACTER VARYING', 'VARCHAR')
                .replace('TIMESTAMP WITHOUT TIME ZONE', 'DATETIME')
            )
            
            # Simple type comparison (ignoring length)
            if 'VARCHAR' in model_type_normalized or 'VARCHAR' in actual_type_normalized:
                continue  # Skip VARCHAR length checks
            
            if model_type != actual_type and model_type_normalized not in actual_type and actual_type_normalized not in model_type:
                type_mismatches.append({
                    'column': col_name,
                    'model_type': model_type,
                    'actual_type': actual_type
                })
        
        if type_mismatches:
            print(f"\n⚠️  TYPE MISMATCHES ({len(type_mismatches)} columns):")
            issues_found = True
            for mismatch in type_mismatches:
                print(f"   - {mismatch['column']}")
                print(f"     Model:    {mismatch['model_type']}")
                print(f"     Database: {mismatch['actual_type']}")
        
        if not missing_in_db and not extra_in_db and not type_mismatches:
            print("\n✅ Schema matches perfectly!")
    
    # Print summary
    print(f"\n{'=' * 80}")
    print("SUMMARY")
    print('=' * 80)
    
    if issues_found:
        print("\n⚠️  ISSUES FOUND - Database schema does not match models!")
        print("\nNext steps:")
        print("1. Review the missing columns above")
        print("2. Create a migration: alembic revision --autogenerate -m 'fix schema'")
        print("3. Review the migration file carefully")
        print("4. Apply migration: alembic upgrade head")
        return 1
    else:
        print("\n✅ All tables and columns match! Database schema is in sync.")
        return 0


if __name__ == '__main__':
    try:
        exit_code = audit_schema()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
