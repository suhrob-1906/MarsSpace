"""
Custom validators for file uploads
"""
from django.core.exceptions import ValidationError
import zipfile
import io


def validate_zip_file(value):
    """
    Validates that the uploaded file is a valid ZIP file
    """
    if not value.name.endswith('.zip'):
        raise ValidationError('File must be a ZIP archive.')
    
    # Try to open and validate ZIP structure
    try:
        # Read first few bytes to check ZIP signature
        value.seek(0)
        file_signature = value.read(4)
        value.seek(0)  # Reset file pointer
        
        # ZIP file signature: PK\x03\x04 or PK\x05\x06 (empty zip) or PK\x07\x08 (spanned)
        if not (file_signature.startswith(b'PK')):
            raise ValidationError('File is not a valid ZIP archive.')
        
        # Try to open as ZIP to validate structure
        try:
            with zipfile.ZipFile(value, 'r') as zip_file:
                # Check if ZIP is not empty
                if len(zip_file.namelist()) == 0:
                    raise ValidationError('ZIP archive is empty.')
                
                # Check for potentially dangerous files
                dangerous_extensions = ['.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.jar']
                for file_name in zip_file.namelist():
                    file_lower = file_name.lower()
                    if any(file_lower.endswith(ext) for ext in dangerous_extensions):
                        raise ValidationError(f'ZIP archive contains potentially dangerous file: {file_name}')
        except zipfile.BadZipFile:
            raise ValidationError('File is not a valid ZIP archive or is corrupted.')
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f'Error validating ZIP file: {str(e)}')
