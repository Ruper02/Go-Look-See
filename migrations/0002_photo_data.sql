-- Modo gratuito sin R2: guarda la imagen comprimida dentro de D1.
-- Ejecutar una sola vez después de 0001_initial.sql.
ALTER TABLE photos ADD COLUMN photo_data BLOB;
