"""
Script de migración para convertir passwords en texto plano a hashes seguros

IMPORTANTE: Este script es OPCIONAL y debe ejecutarse UNA SOLA VEZ
Solo es necesario si tienes usuarios con passwords en texto plano

Uso:
    python migrate_passwords.py
"""
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import Usuario
from app.security import hash_password, is_password_hashed


def migrate_passwords():
    """Migrar todos los passwords en texto plano a hashes seguros"""
    app = create_app()
    
    with app.app_context():
        print("=" * 60)
        print("MIGRACIÓN DE PASSWORDS A FORMATO SEGURO")
        print("=" * 60)
        print()
        
        # Obtener todos los usuarios
        usuarios = Usuario.query.all()
        total = len(usuarios)
        
        if total == 0:
            print("❌ No hay usuarios en la base de datos")
            return
        
        print(f"📊 Usuarios encontrados: {total}")
        print()
        
        # Contar cuántos ya están hasheados
        hasheados = sum(1 for u in usuarios if is_password_hashed(u.password_hash))
        texto_plano = total - hasheados
        
        print(f"✅ Passwords ya hasheados: {hasheados}")
        print(f"⚠️  Passwords en texto plano: {texto_plano}")
        print()
        
        if texto_plano == 0:
            print("✨ Todos los passwords ya están hasheados. No hay nada que migrar.")
            return
        
        # Confirmar migración
        print("⚠️  ADVERTENCIA: Esta operación convertirá los passwords en texto plano a hashes.")
        print("   Los usuarios deberán usar sus contraseñas actuales para hacer login.")
        print()
        respuesta = input("¿Deseas continuar? (sí/no): ").strip().lower()
        
        if respuesta not in ['sí', 'si', 's', 'yes', 'y']:
            print("❌ Migración cancelada")
            return
        
        print()
        print("🔄 Iniciando migración...")
        print()
        
        # Migrar usuarios
        migrados = 0
        for usuario in usuarios:
            if not is_password_hashed(usuario.password_hash):
                # Guardar password temporal (para mostrar en resumen)
                password_original = usuario.password_hash
                
                # Hashear el password
                usuario.password_hash = hash_password(password_original)
                migrados += 1
                
                print(f"  ✓ Migrado: {usuario.email_us}")
        
        # Guardar cambios
        try:
            db.session.commit()
            print()
            print("=" * 60)
            print(f"✅ Migración completada exitosamente")
            print(f"   Usuarios migrados: {migrados}")
            print(f"   Ya estaban hasheados: {hasheados}")
            print("=" * 60)
            print()
            print("💡 Nota: Los usuarios pueden iniciar sesión con sus contraseñas actuales.")
            print("   Los passwords están ahora protegidos con hash seguro.")
        except Exception as e:
            db.session.rollback()
            print()
            print("=" * 60)
            print(f"❌ ERROR: No se pudo completar la migración")
            print(f"   Detalle: {str(e)}")
            print("=" * 60)
            print()
            print("🔄 Se han revertido todos los cambios.")


if __name__ == "__main__":
    migrate_passwords()
